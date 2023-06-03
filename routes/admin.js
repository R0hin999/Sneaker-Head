const e = require('express');
var express = require('express');
var router = express.Router();
var session = require('express-session');
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

router.post("/deliver-order-now",(req,res)=>{
      var name=req.body.name;
      var oid=req.body.oid;
      
      var shipOrderSql = `UPDATE orders SET person_received="${name}", order_status="Delivered",payment_status="Complete" WHERE id=${oid}`;
      conn.query(shipOrderSql,(error)=>{
            if(error){
                  res.send("error");
            }else{
                  res.send("success");
            }
      })

});

router.post("/ship-order-now",(req,res)=>{
      var company=req.body.company;
      var trackID=req.body.trackID;
      var url=req.body.url;
      var oid=req.body.oid;
      var shipOrder = `UPDATE orders SET tracking_id="${trackID}", company_name="${company}", tracking_url="${url}", order_status="Shipped" WHERE id=${oid}`;
      conn.query(shipOrder,(error)=>{
            if(error){
                  res.send("error");
            }else{
                  res.send("success");
            }
      })
      
});


router.get('/Fetch-Delivered-Orders',(req,res)=>{
      var ShippedSQL = `SELECT *, DATE_FORMAT(date_time, "%W %M %e %Y %r") as date_time  FROM orders WHERE order_status = "Delivered"`;
conn.query(ShippedSQL,(error,data)=>{
      if (error){
            res.send('error');
      }else{
            res.send(data);
      }
})
});
router.get('/Fetch-Shipped-Orders',(req,res)=>{
      var ShippedSQL = `SELECT *, DATE_FORMAT(date_time, "%W %M %e %Y %r") as date_time  FROM orders WHERE order_status = "Shipped"`;
conn.query(ShippedSQL,(error,data)=>{
      if (error){
            res.send('error');
      }else{
            res.send(data);
      }
})
});
router.get('/Fetch-Pending-Orders',(req,res)=>{
      var pendingOrders = `SELECT *, DATE_FORMAT(date_time, "%W %M %e %Y %r") as date_time  FROM orders WHERE order_status = "Pending"`;
conn.query(pendingOrders,(error,data)=>{
      if (error){ 
            res.send('error');
      }else{
            res.send(data);
      }
})
});
router.get('/Delivered_orders',(req,res)=>{
      if (session.adminName == undefined) {
            res.redirect('/admin-login');
          } else {
            res.render("admin/Delivered_orders");
          }
});

router.get('/shipped-orders',(req,res)=>{
      if (session.adminName == undefined) {
            res.redirect('/admin-login');
          } else {
            res.render("admin/shipped_orders");
          }
});

router.get('/pending-orders',(req,res)=>{
      if (session.adminName == undefined) {
            res.redirect('/admin-login');
          } else {
            res.render("admin/Pending_Orders");
          }
});




    
module.exports = router;
    