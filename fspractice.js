const express = require("express");
const res = require("express/lib/response");
const { status } = require("express/lib/response");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3002;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// helper function to read the JSOn data file
const JSONReader = (filePath, cb) => {
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

// route to get all recipe names
app.get("/recipes", (req, res) => {
  JSONReader("./data.json", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let recipeNames = [];
      data.recipes.forEach((recipe) => {
        recipeNames.push(recipe.name);
      });
      res.json({
        "recipe names": recipeNames,
        status: res.statusCode,
      });
    }
  });
});

// route to get the number of steps and ingredients for a specific recipe
app.get("/recipes/details/:name", (req, res) => {
  let nameRequest = req.params.name.toLowerCase();
  let stepsNum = 0;
  JSONReader("./data.json", (err, data) => {
    let recipeData = data.recipes;
    for (let i = 0; i < recipeData.length; i++) {
      if (nameRequest === recipeData[i].name.toLowerCase()) {
        for (let j = 0; j < recipeData[i].instructions.length; j++) {
          stepsNum++;
        }
        return res.json({
          "number of steps": stepsNum,
          ingredients: recipeData[i].ingredients,
          status: res.statusCode,
        });
      }
    }
  });
});

JSONReader("./data.json", (err, data) => {});

app.post("/recipes", (req, res) => {
  let newRecipe = req.body.name.toLowerCase();

  let checkNames = () => {
    JSONReader("./data.json", (err, data) => {
      let recipeNames = [];
      let recipeData = data.recipes;

      for (let i = 0; i < recipeData.length; i++) {
        recipeNames.push(recipeData.name.toLowerCase());
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
    });
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
      JSONReader("./data.json", (err, data) => {
        if (err) {
          console.log(err);
        } else {
        }
      });

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
