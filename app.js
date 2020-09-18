const ex=require("express");
const bp=require("body-parser");
// var items=[];
const app=ex();
const mongoose=require("mongoose");
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bp.urlencoded({extended: true}));
app.use(ex.static("public"));//to add css to your webpage

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true , useUnifiedTopology: true });
const schema= {
  name: String
};
const listSchema={
  name: String,
  items:[schema]
};

const List=mongoose.model("List",listSchema);

const Item= mongoose.model("Item", schema);

const item1 = new Item({
  name: "Hello"
});
const item2 = new Item({
  name: "peeps"
});
const item3 = new Item({
  name: "wassup"
});


const defaultArray=[item1, item2, item3];




app.get("/",function(req,res){
  //
  // var today= new Date(); //automatic function to select date
  // var options={
  //   weekday:"long",
  //   day:"numeric",
  //   month:"long",
  //   year:"numeric"
  // };// making object to determine the format of date
  // var day=today.toLocaleDateString("en-US",options);//selecting format of string
  Item.find({}, function(err, item){
    if(item.length===0){

      Item.insertMany(defaultArray, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success");
        }
      });
        res.render("list", {Day: "Today",listItems:item});

    }
    else{
      res.render("list", {Day: "Today",listItems:item});
    }
  });
   //shows list in home page target to the location list.ejs inside views using view engine//
});
// Item.find({}, function(err, item){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log(item);
//   }
// });
app.get("/:customList", function(req,res){
  const newlist=_.capitalize(req.params.customList);//so that any input is not case sensitive
  List.findOne({name: newlist},function(err,foundlist){
    if(!foundlist){
      const list=new List({
        name: newlist,
        items: defaultArray
      });
      list.save();
      res.redirect("/"+ newlist);
    }
    else{
      res.render("list",{Day: foundlist.name, listItems:foundlist.items});
    }
  });

});


app.post("/",function(req,res){
 const newitem= req.body.newitem;
 const listName= req.body.button;
 const item= new Item({
   name: newitem
 });
 if(listName==="Today"){
 item.save();
res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+ listName);
  })
}
});//new item added

app.post("/delete", function(req,res){
const check = req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){

 Item.findByIdAndRemove(check, function(err){
   if(!err){
     console.log("Successfully deleted");
     res.redirect("/");
   }
 });
}
else{
  List.findOneAndUpdate({name: listName},{$pull: {items:{_id:check}}}, function(err,foundlist) {
  if(!err){
    res.redirect("/"+listName);
  }
});
}
});

app.listen(3000,function(res,req){
  console.log("Server is working");
});//listen to server
