
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://z4cope:Mm012262900458793@cluster0.xbmna.mongodb.net/todolistDB?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true});



const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome !"
});

const item2 = new Item({
  name: "To add an item type your task and click the + button"
});

const item3 = new Item({
  name: "And to remove and item mark the checkbox beside the item on the left side"
});

const welcomeArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(welcomeArray, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Your items have been inserted successfully");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

});


app.get("/:pageName", function(req, res) {

  const dinamicListName = _.capitalize(req.params.pageName);

  List.findOne({name: dinamicListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // New list creation
        const list = new List ({
          name: dinamicListName,
          items: welcomeArray
        })
        list.save();
        res.redirect("/" + dinamicListName);
      } else {
        // Run the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName
  });


  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      if (err) {
        console.log(err)
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

  
  
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.hiddenInput;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Your item has been deleted successfully");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundItem) {
      if(!err) {
        res.redirect("/" + listName);
      }
    })
  }
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port, function () {
  console.log("Server has started successfully");
});
