import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { parseString } from 'xml2js';
import axios from 'axios';
dotenv.config();
const PORT = process.env.PORT || 8000;
const app=express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // it enables Cross-Origin Resource Sharing (CORS) for the application.

const kml = fs.readFileSync('asset.kml', 'utf8');

let outletData;

parseString(kml, (err, result) => {
  if (err) {
    console.error('Error parsing KML file:', err);
    throw err;
  }

  outletData = result;
});



function isPointInsidePolygon(point, polygon) {
  const longitude = point.longitude;
  const latitude = point.latitude;
  
  polygon = polygon[0].trim().split('\n').map(coord => coord.trim().split(','));

  let intersections = 0;
  const vertexCount = polygon.length;

  for (let i = 0, j = vertexCount - 1; i < vertexCount; j = i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[j];

    if ((y1 > latitude !== y2 > latitude) && (longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + Number(x1))) {
      intersections++;
    }
  }

  // If the number of intersections is odd, the point is inside the polygon
  return intersections % 2 === 1;

}


app.post('/api/outlet', async (req, res) => {
  const { address } = req.body;

  try {
    let coordinates;
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
    });

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      coordinates =  { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      // throw new Error('No results found for the address.');
      return res.status(404).json({outletName:"No results found for the address"});
    }
    
    const polygons = outletData.kml.Document[0].Placemark;
    let outletName = 'not found';

    polygons.forEach(placemark => {
      let polygon =placemark.Point?placemark.Point[0].coordinates:placemark?.Polygon[0]?.outerBoundaryIs[0]?.LinearRing[0].coordinates;
      if (isPointInsidePolygon(coordinates, polygon)) {
        outletName = placemark.name[0];
      }
    });

    res.json({ outletName });
  } catch (error) {
    console.error('Error finding outlet name:', error);
    res.status(500).json({message:error.message});
  }
});


app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
  });


