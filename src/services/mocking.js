import {faker} from '@faker-js/faker';

export const generateMockProducts = (qty) => {
  const products = [];
  for (let i = 0; i < qty; i++) {
    const product = {
      /* _id: faker.string.uuid(), */
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      image: faker.image.url(),
      /* stock: faker.datatype.number({ min: 0, max: 100 }), */
    };
    products.push(product);
  }
  return products;
};
