function salePrice(original, discountPercent) {
  return Math.round(Number(original) * (100 - Number(discountPercent)) / 100);
}

function mapProduct(row) {
  const originalPrice = Number(row.original_price || row.price_max || 0);
  const discountPercent = Number(row.discount_percent || 0);
  return {
    id: row.id,
    sku: row.sku,
    modelNumber: row.sku,
    name: row.name,
    brand: row.brand,
    type: row.type,
    description: row.description,
    priceMin: row.price_min,
    priceMax: row.price_max,
    originalPrice,
    discountPercent,
    salePrice: salePrice(originalPrice, discountPercent),
    rating: Number(row.rating || 0),
    moq: row.moq,
    material: row.material,
    innerDiameter: row.inner_diameter,
    outerDiameter: row.outer_diameter,
    imageUrl: row.image_url,
    filterC: row.filter_c,
    filterD: row.filter_d
  };
}

function productFromBody(body = {}) {
  const original_price = Number(body.originalPrice ?? body.original_price ?? body.priceMax ?? body.price_max);
  const discount_percent = Number(body.discountPercent ?? body.discount_percent ?? 0);
  const sale = salePrice(original_price, discount_percent);
  return {
    sku: String(body.sku || body.modelNumber || '').trim(),
    name: String(body.name || '').trim(),
    brand: String(body.brand || '').trim(),
    type: String(body.type || '').trim(),
    description: String(body.description || '').trim(),
    price_min: sale,
    price_max: original_price,
    original_price,
    discount_percent,
    rating: Number(body.rating ?? 4),
    moq: Number(body.moq),
    material: String(body.material || '').trim(),
    inner_diameter: String(body.innerDiameter || body.inner_diameter || '').trim(),
    outer_diameter: String(body.outerDiameter || body.outer_diameter || '').trim(),
    image_url: String(body.imageUrl || body.image_url || '/images/bearing-1.svg').trim(),
    filter_a: String(body.filterA || body.filter_a || 'A1').trim(),
    filter_b: String(body.filterB || body.filter_b || 'B1').trim(),
    filter_c: String(body.filterC || body.filter_c || '').trim(),
    filter_d: String(body.filterD || body.filter_d || '').trim()
  };
}

function validateProduct(row) {
  const required = [
    'sku', 'name', 'brand', 'type', 'description', 'material',
    'inner_diameter', 'outer_diameter', 'image_url',
    'filter_c', 'filter_d'
  ];
  for (const key of required) {
    if (!row[key]) {
      return `${key} is required`;
    }
  }
  if (Number.isNaN(row.original_price) || Number.isNaN(row.moq) || Number.isNaN(row.discount_percent)) {
    return 'originalPrice, discountPercent, and moq must be numbers';
  }
  return null;
}

const INSERT_SQL = `
  INSERT INTO products (
    sku, name, brand, type, description, price_min, price_max, moq,
    material, inner_diameter, outer_diameter, image_url,
    filter_a, filter_b, filter_c, filter_d,
    original_price, discount_percent, rating
  ) VALUES (
    @sku, @name, @brand, @type, @description, @price_min, @price_max, @moq,
    @material, @inner_diameter, @outer_diameter, @image_url,
    @filter_a, @filter_b, @filter_c, @filter_d,
    @original_price, @discount_percent, @rating
  )
`;

const UPDATE_SQL = `
  UPDATE products SET
    sku = @sku,
    name = @name,
    brand = @brand,
    type = @type,
    description = @description,
    price_min = @price_min,
    price_max = @price_max,
    moq = @moq,
    material = @material,
    inner_diameter = @inner_diameter,
    outer_diameter = @outer_diameter,
    image_url = @image_url,
    filter_a = @filter_a,
    filter_b = @filter_b,
    filter_c = @filter_c,
    filter_d = @filter_d,
    original_price = @original_price,
    discount_percent = @discount_percent,
    rating = @rating
  WHERE id = @id
`;

module.exports = {
  mapProduct,
  productFromBody,
  validateProduct,
  INSERT_SQL,
  UPDATE_SQL
};
