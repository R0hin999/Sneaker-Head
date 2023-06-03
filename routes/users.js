var express = require('express');
const session=require("express-session");
var router = express.Router();
var mysql = require('mysql');
var conn = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: null,
    database: "sneaker_head"
  });

conn.connect(function (error) {
  if (error) throw error;
  console.log("Database Connected");
});



router.post("/place-order",(req,res)=>{
  var city=req.body.city;
  var pincode=req.body.pincode;
  var address=req.body.address;
  var paymode=req.body.paymode;
  var grandtotal=req.body.grandtotal;
  var username= session.userName ;
  // console.log(city);
  // console.log(pincode);
  // console.log(address);
  // console.log(paymode);
  // console.log(grandtotal);
  // console.log(username);

 var payment_status="";
 if (paymode=="COD"){

  payment_status="Pending";
 }else{
  payment_status="Complete";
 }
  var orderSQL=`INSERT into orders (grand_total,payment_mode,city,pincode,address,order_status,username,payment_status)
  VALUES("${grandtotal}","${paymode}","${city}","${pincode}","${address}","Pending","${username}","${payment_status}")`;
  conn.query(orderSQL,(error,row)=>{
    if(error){
      res.send("error");
    }
    else{
      // console.log(row);
      var lastInsertedID=row.insertId;
      // console.log(JSON.parse(lastInsertedID));
      
      // console.log(session.cart);
      var cart=session.cart;
      for(var i=0;i<cart.length;i++){
        // console.log(cart[i]);
        var id=cart[i].id;
        var pname= cart[i].product_name;
        var price=cart[i].price;
        var discount=cart[i].discount;
        var discountprice=cart[i].disprice;
        var quantity=cart[i].quantity;
        var size=cart[i].size;

        var detailsSql=`Insert into order_details(price,discount,discounted_price,size,quantity,product_id,order_id) Values("${price}","${discount}","${discountprice}","${size}","${quantity}",${id},${lastInsertedID})`;
        conn.query(detailsSql,(err)=>{
          if(err){
            console.log(err);
            res.send("error");
          }
        })
      };
      if (paymode=="COD"){
        res.send("success");
        session.cart=undefined;
      }
      else{
        session.bill_id=lastInsertedID;
        session.totalAmt=grandtotal;
        res.send("online")
      }
      // console.log("Khali");
    }
  });  

});

router.get('/payment_action',(req,res)=>{
  var payment_id=req.query.payment_id;
  if (payment_id==""){
    res.send("failed")
  }else{
   var bill_id= session.bill_id;
    var updateSQL=  `UPDATE orders SET ref_id="${payment_id}" WHERE id=${bill_id}`;
    if (err){
      res.send("error")
    }else{
      session.bill_id=undefined;
      session.totalAmt=undefined;
      session.cart=undefined;
      res.send("success")
    }
  }
})

router.get("/razor-pay",(req,res)=>{
  if (session.userName!=undefined){
    res.render("users/razorpay",{totalAmt:session.totalAmt  })
  }
  else{
    res.redirect("/User-login");
  }
})
router.get('/thank-you',(req,res)=>{
  res.render("users/thank_you");
})

router.get('/user-logout',(req,res)=>{
  session.userName=undefined;
  session.fullname=undefined;
  res.send("logoutuser")
    res.redirect('/User-login');
  
})

router.get("/About-uss",(req,res)=>{
  res.render("users/AboutUs2");
});

router.get('/Fetch-my-Orders',(req,res)=>{
  var username=session.userName;
  var pendingOrders = `SELECT *, DATE_FORMAT(date_time, "%W %M %e %Y %r") as date_time  FROM orders WHERE username= "${username}"`;
conn.query(pendingOrders,(error,data)=>{
  if (error){
        res.send('error');
  }else{
        res.send(data);
  }
})
});
router.get("/cancel-my-Order",(req,res)=>{
  // var name=req.body.name;
  var oid=req.query.oid;
  
  var shipOrderSql = `UPDATE orders SET order_status="Cancelled" WHERE id=${oid}`;
  conn.query(shipOrderSql,(error)=>{
        if(error){
              res.send("error");
        }else{
              res.send("success");
        }
  })

});


router.get("/my-orders",(req,res)=>{
  
  if (session.userName!=undefined){
    res.render("users/my-orders");
  }else{
    res.redirect("/User-login");
  }
});

router.get("/change-password",(req,res)=>{
  
  if (session.userName!=undefined){
    res.render("users/change_pass");
  }else{
    res.redirect("/User-login");
  }
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  if (session.userName!=undefined){
    var showsql = `SELECT * FROM products WHERE subcategory_id BETWEEN 7 AND 8 order by id desc; `;
//  var sql=`select * from`
var name= session.fullname;
   conn.query(showsql, (error,row) => {
 
    if (error) {
     return res.send('error');
    } else {
      res.render("users/user_home", {row,name})

// console.log(session.fullname);
    }
})
  }else{
    res.redirect("/");
  }
});

module.exports = router;
