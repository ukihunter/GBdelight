export const categories = [
  {
    key: "cake-slice",
    label: "Cake Slice",
    image: require("../assets/category/cake-slice.png"),
    color: "#c07171",
  },
  {
    key: "cake",
    label: "Cake",
    image: require("../assets/category/cake.png"),
    color: "#c09171",
  },
  {
    key: "cookies",
    label: "Cookies",
    image: require("../assets/category/cookies.png"),
    color: "#abc071",
  },
  {
    key: "cupcake",
    label: "Cupcake",
    image: require("../assets/category/muffin.png"),
    color: "#c0ae71",
  },
];

export const productsByCategory = {
  "cake-slice": [
    {
      id: 1,
      name: "Chocolate Slice",
      image: require("../assets/products/cake1.png"),
      price: 4.99,
    },
    // ...more products
    {
      id: 2,
      name: "Chocolate Slice",
      image: require("../assets/products/cake3.jpg"),
      price: 4.99,
    },
    {
      id: 3,
      name: "Butterfly cake ",
      image: require("../assets/products/cake3.jpg"),
      price: 4.99,
      description: "Delicious chocolate slice with rich flavor.",
      ingredients: ["Flour", "Sugar", "Cocoa", "Butter", "Eggs"],
    },
    {
      id: 4,
      name: "Chocolate Slice",
      image: require("../assets/products/cake3.jpg"),
      price: 4.99,
    },
    {
      id: 5,
      name: "Chocolate Slice",
      image: require("../assets/products/cake3.jpg"),
      price: 4.99,
    },
    {
      id: 6,
      name: "Chocolate Slice",
      image: require("../assets/products/cake1.png"),
      price: 4.99,
    },
    {
      id: 7,
      name: "Chocolate Slice",
      image: require("../assets/products/cake1.png"),
      price: 4.99,
    },
    {
      id: 8,
      name: "Chocolate Slice",
      image: require("../assets/products/cake1.png"),
      price: 4.99,
    },
  ],
  cake: [
    {
      id: 9,
      name: "Vanilla Cake",
      image: require("../assets/products/cake1.png"),
      price: 4.99,
    },
    // ...more products
  ],
  cookies: [
    {
      id: 10,
      name: "Choco Chip Cookie",
      image: require("../assets/products/cake1.png"),
    },
    // ...more products
  ],
  cupcake: [
    {
      id: 11,
      name: "Strawberry Cupcake",
      image: require("../assets/products/cake1.png"),
    },
    // ...more products
  ],
};
