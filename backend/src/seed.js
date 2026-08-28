const db = require('./db');

const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
if (count > 0) {
  console.log(`Database already has ${count} products`);
} else {

const products = [
  {
    sku: '6205-2RS',
    name: 'Deep Groove Ball Bearing 6205-2RS',
    brand: 'SKF',
    type: 'Deep Groove Ball Bearing',
    description: 'Sealed deep groove ball bearing for motors, pumps, and general machinery. Low noise and ready for grease-lubricated service.',
    price_min: 2.4,
    price_max: 6.8,
    moq: 10,
    material: 'Chrome steel',
    inner_diameter: '25 mm',
    outer_diameter: '52 mm',
    image_url: '/images/bearing-1.svg',
    filter_a: 'A1',
    filter_b: 'B1',
    filter_c: 'C1',
    filter_d: 'D1'
  },
  {
    sku: '6308-ZZ',
    name: 'Deep Groove Ball Bearing 6308 ZZ',
    brand: 'NSK',
    type: 'Deep Groove Ball Bearing',
    description: 'Metal-shielded 6308 series bearing for high radial loads in industrial equipment.',
    price_min: 8.1,
    price_max: 14.5,
    moq: 5,
    material: 'Bearing steel',
    inner_diameter: '40 mm',
    outer_diameter: '90 mm',
    image_url: '/images/bearing-2.svg',
    filter_a: 'A2',
    filter_b: 'B1',
    filter_c: 'C2',
    filter_d: 'D1'
  },
  {
    sku: '7205-B',
    name: 'Angular Contact Ball Bearing 7205 B',
    brand: 'FAG',
    type: 'Angular Contact Ball Bearing',
    description: 'Single-row angular contact bearing for combined radial and axial loads in spindles and gearboxes.',
    price_min: 12.0,
    price_max: 22.0,
    moq: 4,
    material: 'Chrome steel',
    inner_diameter: '25 mm',
    outer_diameter: '52 mm',
    image_url: '/images/bearing-3.svg',
    filter_a: 'A1',
    filter_b: 'B2',
    filter_c: 'C1',
    filter_d: 'D2'
  },
  {
    sku: '32210',
    name: 'Tapered Roller Bearing 32210',
    brand: 'Timken',
    type: 'Tapered Roller Bearing',
    description: 'Metric tapered roller bearing for wheel hubs, transmissions, and heavy-duty axles.',
    price_min: 15.5,
    price_max: 28.0,
    moq: 2,
    material: 'Alloy steel',
    inner_diameter: '50 mm',
    outer_diameter: '90 mm',
    image_url: '/images/bearing-4.svg',
    filter_a: 'A3',
    filter_b: 'B2',
    filter_c: 'C3',
    filter_d: 'D2'
  },
  {
    sku: '22218-E',
    name: 'Spherical Roller Bearing 22218 E',
    brand: 'SKF',
    type: 'Spherical Roller Bearing',
    description: 'Self-aligning spherical roller bearing for misalignment and heavy radial loads.',
    price_min: 48.0,
    price_max: 76.0,
    moq: 1,
    material: 'Bearing steel',
    inner_diameter: '90 mm',
    outer_diameter: '160 mm',
    image_url: '/images/bearing-5.svg',
    filter_a: 'A2',
    filter_b: 'B3',
    filter_c: 'C2',
    filter_d: 'D3'
  },
  {
    sku: 'NU210',
    name: 'Cylindrical Roller Bearing NU210',
    brand: 'NTN',
    type: 'Cylindrical Roller Bearing',
    description: 'Separable cylindrical roller bearing for high radial capacity and high-speed shafts.',
    price_min: 18.0,
    price_max: 31.0,
    moq: 2,
    material: 'Chrome steel',
    inner_diameter: '50 mm',
    outer_diameter: '90 mm',
    image_url: '/images/bearing-6.svg',
    filter_a: 'A3',
    filter_b: 'B1',
    filter_c: 'C3',
    filter_d: 'D1'
  },
  {
    sku: 'UCP205',
    name: 'Pillow Block Bearing UCP205',
    brand: 'NSK',
    type: 'Pillow Block Bearing',
    description: 'Cast-iron housed unit with insert bearing for conveyors and agricultural equipment.',
    price_min: 6.2,
    price_max: 11.4,
    moq: 8,
    material: 'Cast iron housing',
    inner_diameter: '25 mm',
    outer_diameter: 'Housing unit',
    image_url: '/images/bearing-7.svg',
    filter_a: 'A1',
    filter_b: 'B3',
    filter_c: 'C1',
    filter_d: 'D3'
  },
  {
    sku: '51108',
    name: 'Thrust Ball Bearing 51108',
    brand: 'FAG',
    type: 'Thrust Ball Bearing',
    description: 'Single-direction thrust ball bearing for axial loads in rotating assemblies.',
    price_min: 4.8,
    price_max: 9.5,
    moq: 6,
    material: 'Chrome steel',
    inner_diameter: '40 mm',
    outer_diameter: '60 mm',
    image_url: '/images/bearing-8.svg',
    filter_a: 'A2',
    filter_b: 'B2',
    filter_c: 'C2',
    filter_d: 'D2'
  },
  {
    sku: 'HK2016',
    name: 'Needle Roller Bearing HK2016',
    brand: 'INA',
    type: 'Needle Roller Bearing',
    description: 'Drawn-cup needle roller bearing for compact, high-load applications.',
    price_min: 1.9,
    price_max: 4.2,
    moq: 20,
    material: 'Needle steel',
    inner_diameter: '20 mm',
    outer_diameter: '26 mm',
    image_url: '/images/bearing-1.svg',
    filter_a: 'A3',
    filter_b: 'B3',
    filter_c: 'C3',
    filter_d: 'D1'
  },
  {
    sku: '6204-C3',
    name: 'Deep Groove Ball Bearing 6204 C3',
    brand: 'NTN',
    type: 'Deep Groove Ball Bearing',
    description: 'C3 clearance 6204 bearing for electric motors and HVAC fans.',
    price_min: 1.6,
    price_max: 3.9,
    moq: 25,
    material: 'Chrome steel',
    inner_diameter: '20 mm',
    outer_diameter: '47 mm',
    image_url: '/images/bearing-2.svg',
    filter_a: 'A1',
    filter_b: 'B1',
    filter_c: 'C3',
    filter_d: 'D2'
  },
  {
    sku: '30205',
    name: 'Tapered Roller Bearing 30205',
    brand: 'Koyo',
    type: 'Tapered Roller Bearing',
    description: 'Compact tapered roller set for automotive and industrial gearboxes.',
    price_min: 5.5,
    price_max: 10.8,
    moq: 10,
    material: 'Alloy steel',
    inner_diameter: '25 mm',
    outer_diameter: '52 mm',
    image_url: '/images/bearing-4.svg',
    filter_a: 'A2',
    filter_b: 'B2',
    filter_c: 'C1',
    filter_d: 'D3'
  },
  {
    sku: '7008-P4',
    name: 'High Precision Angular Contact 7008 P4',
    brand: 'SKF',
    type: 'Angular Contact Ball Bearing',
    description: 'P4 precision spindle bearing for high-speed machine tools and semiconductor equipment.',
    price_min: 36.0,
    price_max: 58.0,
    moq: 1,
    material: 'Super precision steel',
    inner_diameter: '40 mm',
    outer_diameter: '68 mm',
    image_url: '/images/bearing-3.svg',
    filter_a: 'A3',
    filter_b: 'B1',
    filter_c: 'C2',
    filter_d: 'D3'
  }
];

const insert = db.prepare(`
  INSERT INTO products (
    sku, name, brand, type, description, price_min, price_max, moq,
    material, inner_diameter, outer_diameter, image_url,
    filter_a, filter_b, filter_c, filter_d
  ) VALUES (
    @sku, @name, @brand, @type, @description, @price_min, @price_max, @moq,
    @material, @inner_diameter, @outer_diameter, @image_url,
    @filter_a, @filter_b, @filter_c, @filter_d
  )
`);

const tx = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

tx(products);
  console.log(`Seeded ${products.length} products`);
}

const { migrateCatalog } = require('./migrate');
migrateCatalog(db);
