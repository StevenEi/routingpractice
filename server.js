const express = require("express");
const res = require("express/lib/response");
const { status } = require("express/lib/response");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3002;
const recipesData = require("./data.json");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const jsonReader = (filePath, cb) => {
  fs.readFile(filePath, "utf-8", (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      let object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
};

app.get("/recipes", (req, res) => {
  let recipeNames = [];
  recipesData.recipes.forEach((recipe) => {
    recipeNames.push(recipe.name);
  });
  res.json({
    recipeNames: recipeNames,
    status: res.statusCode,
  });
});

app.get("/recipes/details/:name", (req, res) => {
  let nameRequest = req.params.name.toLowerCase();
  let recipesObjs = recipesData.recipes;
  let stepsNum = 0;

  for (let i = 0; i < recipesObjs.length; i++) {
    if (nameRequest === recipesObjs[i].name.toLowerCase()) {
      for (let j = 0; j < recipesObjs[i].instructions.length; j++) {
        stepsNum++;
      }
      return res.json({
        "number of steps": stepsNum,
        ingredients: recipesObjs[i].ingredients,
        status: res.statusCode,
      });
    }
  }
  res.json({ status: res.statusCode });
});

app.post("/recipes", (req, res) => {
  let newRecipe = req.body.name.toLowerCase();
  let recipesObjs = recipesData.recipes;

  let checkNames = () => {
    let recipeNames = [];

    for (let i = 0; i < recipesObjs.length; i++) {
      recipeNames.push(recipesObjs[i].name.toLowerCase());
    }

    for (let i = 0; i < recipeNames.length; i++) {
      if (recipeNames[i] === newRecipe) {
        return res.json({
          error: "Recipe already exists",
          status: 400,
        });
      } else {
        createRecipe();
      }
    }
  };

  let createRecipe = () => {
    let { name, ingredients, instructions } = req.body;

    if (name && ingredients && instructions) {
      let newRecipe = {
        name,
        ingredients,
        instructions,
      };

      let response = {
        status: res.statusCode,
        body: newRecipe,
      };

      console.log(response);
      jsonReader("./data.json", (err, data) => {
        if (err) {
          console.log(err)
        } else {
          
        }
      })

      res.status(201).json(response);
    } else {
      res.status(500).json("Error in creating new recipe");
    }
  };

  checkNames();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
