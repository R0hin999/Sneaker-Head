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



router.get('/logout_admin', (req, res) => {
  session.adminName = undefined;
  res.send("logout");

});

router.get('/check-session-created', (req, res) => {
  if (session.username == undefined) {
    res.redirect('/admin-login');
  } else {
    res.send(session.username);
  }
});

router.get('/test-session', (req, res) => {
  session.username = 'Rohin';
  res.send('Session Created');
});
// ..............................................


router.get('/check-user-session', (req, res) => {
  if (session.userName == undefined) {
    res.redirect('/User-login');
  } else {

    res.redirect('/checkout');
  }
});

router.get('/users/Contact-us',(req,res)=>{
  if (session.userName == undefined) {
    res.redirect('/User-login');
  } else {
    
    res.render('/Contact-us',{name});
    
  }
})

router.get('/Contact-us',(req,res)=>{
  res.render('ContactUs');
})




router.post('/checkout', (req, res) => {
  var cityname = req.body.cityname;
  var getpinSQl = `SELECT zipcode FROM city where city_name="${cityname}" `;
  
  //  var GetSql=`Select * from Subcategory order by subcategory_id desc`;
  conn.query(getpinSQl, (error, row) => {
    if (error) {
      // console.log("error");
    } else {
      res.send(row);
    }
  });
  // session.cart=undefined;

});

router.get('/checkout', (req, res) => {
  if (session.userName != undefined) {
  var getcitySQl = `SELECT * FROM city order by city_name asc`;
  //  var getpinSQl=`SELECT zipcode FROM city where city_name ="Amritsar" `;
  conn.query(getcitySQl, (error, data) => {
    if (error) {
      console.log("error");
    } else {
      res.render('checkout', { city: data });
      // console.log(data);
    }
  })}
  else {
    res.redirect('/User-login');
    // console.log(session.userName)
  }
});

// router.get("/checkout", (req, res) => {
//   if (session.userName != undefined) {
//     console.log(session.userName)
//     res.render("checkout");
//   } else {
//     res.redirect('/User-login');
//     console.log(session.userName)
//   }
// });

router.get("/shopping-cart", (req, res) => {
  res.render("Shoppingcart");
  
  // console.log(session.userName)
});

router.post('/add-to-cart', (req, res) => {
  // console.log(JSON.parse(req.body.productObject));
  var action = req.body.action;
  var size=req.body.size;
  console.log(size);
  var cartArray = [];

  if (session.cart != undefined) {
    cartArray = session.cart;

  }
  if (action == 'add') {
    var productObject = JSON.parse(req.body.productObject);
    console.log(productObject)
    var product_name = productObject.product_name;
    var price = productObject.price;
    var discount = productObject.discount;
    var description = productObject.description;
    var photo = productObject.photo;
    var id = productObject.id;
    var disprice = Math.round(price - (price * discount) / 100);
    var upq=`UPDATE products SET size="${size}" WHERE id = ${id}`
    conn.query(upq);
   
    var cartObject = {
      id: id,
      product_name: product_name,
      price: price,
      discount: discount,
      description: description,
      photo,
      disprice,
      quantity: 1,
      size:size,
      
    };
   
    var isExist = false;
    for (var item of cartArray) {
      if (item.id == id && item.size ==size) {
        isExist = true;
        break;
      }
    }

    if (isExist) {
      res.send("Exist")
    } else {
      // cartObject. quantity=1;
      cartArray.push(cartObject);
      session.cart = cartArray;
      // console.log(session.cart);
      res.send("success");

    }


  }
  // Quantity update in cart
  else if (action == "plus" || action == "minus") {
    var pid = req.body.pid;
    var size = req.body.size;
    for (var i = 0; i < cartArray.length; i++) {
      if (cartArray[i].id == pid && cartArray[i].size == size) 
      {
        if (action == "plus") {
          cartArray[i].quantity += 1;
        } else {
          if(cartArray[i].quantity<=1){
            res.send("error");
            break;
          }
          else{
          cartArray[i].quantity -= 1;
          }
        }
      }
    }
    session.cart = cartArray;

    var amount = Calculate_GrandTotal(cartArray);
    session.grandtotal = amount;

    res.send("updated");



  } else if (action == "remove") {
    var pid = req.body.pid;
    var size = req.body.size;
    var temp_array = [];


    temp_array = cartArray.filter(function (value) {
      if (value.id != pid || value.size!=size) {
        return value;
      }
    });
    cartArray.push(temp_array);
    session.cart = temp_array;
    res.send("Removed");
   
  }
else if(action=="check"){
  if(session.cart==""){

    res.send("clear")
    // console.log(action)
  }else{
    res.send("notclear")
  }

}
  // View products in Session Cart
  else {
    // var amount =Calculate_GrandTotal(cartArray);
      res.send(session.cart);
  }
});

function Calculate_GrandTotal(cart) {
  var total = 0;
  for (var item of cart) {
    total += item.disprice * item.quantity;
  }
  return total;
};
 

router.get("/get-MenNike",(req,res)=>{
  var iossql=`SELECT * FROM products where subcategory_id=7 order  by id desc`;
  conn.query(iossql,(error,rows)=>{
    if(error){
      // console.log('error');
      res.send(error);
    }else{
      // console.log(rows);
      res.send(rows);
      // res.render('Smartphone');
    }
  })
});
router.get("/get-MenAdidas",(req,res)=>{
  var iossql=`SELECT * FROM products where subcategory_id=8 order by id desc`;
  conn.query(iossql,(error,rows)=>{
    if(error){
      // console.log('error');
      res.send(error);
    }else{
      // console.log(rows);
      res.send(rows);
    }
  })
});
router.get("/get-MenPuma",(req,res)=>{
  var iossql=`SELECT * FROM products where subcategory_id=9 order by id desc`;
  conn.query(iossql,(error,rows)=>{
    if(error){
      // console.log('error');
      res.send(error);
    }else{
      // console.log(rows);
      res.send(rows);
      // res.render('Smartphone');
    }
  })
});



router.get('/get-MenSneakers', (req, res) => {
  var selectSQL = ` SELECT * FROM products where subcategory_id in (select subcategory_id FROM subcategory where c_id=6)order by id desc`;
  conn.query(selectSQL, (error, rows) => {
    if (error) {
      res.send("error");  
    } else {
      res.send(rows);
    }
  });

});
router.post('/admin_change_pass', (req, res) => {

  var current = req.body.current;
  var newPassword = req.body.newPassword;
  var confirm = req.body.confirmPassword;
  var email = session.adminEmail;
  var checkpassword = `select * from admin where email="${email}"`;
  conn.query(checkpassword, (error, row) => {
    if (error) {
      res.send("error");
    } else {
      // console.log(row);
      var password = row[0].password;
      // console.log(password);
      if (password != current) {
        res.send('invalid');
      }
      else {
        // res.send('updated');
        var updateSQL = `update admin set \`password\`='${newPassword}' where email="${email}"`;
        conn.query(updateSQL, (error) => {
          if (error) {
            res.send("error");
          } else {
            res.send("updated");
          }
        });
      }
    }
  });


});
router.post('/user_change_pass', (req, res) => {

  var current = req.body.current;
  var newPassword = req.body.newPassword;
  var confirm = req.body.confirmPassword;
  var username = session.userName;
  var checkuser = `select * from users where username="${username}"`;
  conn.query(checkuser, (error, row) => {
    if (error) {
      res.send("error");
    } else {
      // console.log(row);
      var password = row[0].password;
      // console.log(password);
      if (password != current) {
        res.send('invalid');
      }
      else {
        // res.send('updated');
        var updateSQL = `update users set \`password\`='${newPassword}' where username="${username}"`;
        conn.query(updateSQL, (error) => {
          if (error) {
            res.send("error");
          } else {
            res.send("updated");
          }
        });
      }
    }
  });


});

router.get('/admin_change_pass', (req, res) => {

  if (session.adminName == undefined) {
    res.redirect("/admin-login");
  } else {
    res.render('admin_change_pass');
  }
});
router.post('/admin-login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  var loginSQL = `Select * from admin where email="${email}" and password="${password}"`;
  conn.query(loginSQL, (error, data) => {
    if (error) {
      res.send('error');
    } else {
      // console.log(data);
      if (data.length > 0) {
        session.adminEmail = email;
        session.adminName = data[0].name;


        res.send('Success');

      } else {
        res.send('invalid');
      }

    }
  });

});
// Back to Login Page  
router.get('/admin_home', (req, res) => {
  if (session.adminName == undefined) {
    res.redirect("/admin-login");
  } else {
    res.render("admin_home", { name: session.adminName });
  }
})
router.get('/admin-login', (req, res) => {
  res.render("admin_login");
});


  router.get('/view-product', (req, res) => {
  var selectProducts = `Select * from products order by id desc`;
  conn.query(selectProducts, (error, rows) => {
    if (error) {
      res.send('error');
    } else {
      res.send(rows);
    }
  });

});
router.post('/add-product', (req, res) => {
  var subcategory = req.body.subcategory;
  var productName = req.body.productName;
  var price = req.body.price;
  var discount = req.body.discount;
  var description = req.body.description;
  var photo = req.files.photo;

  // console.log(photo);
  var serverpath = `public/products/${photo.name}`;
  var databasepath = `products/${photo.name}`;
  photo.mv(serverpath, function (error) {
    if (error) {
      // console.log(error);
    }
  });
  var insertSQL = `Insert into products (product_name,photo,price,discount,description,subcategory_id)values("${productName}","${databasepath}","${price}","${discount}","${description}",${subcategory})`;
  conn.query(insertSQL, (error) => {
    if (error) {
      res.send("error");
    } else {
      res.send('added')
    }
  });
});

router.get('/fetch-subcategory-relted-to-category', (req, res) => {
  var categoryID = req.query.category_id;
  var getsql = `select * from subcategory where c_id=${categoryID}`;
  conn.query(getsql, (error, rows) => {
    if (error) {
      // console.log(error);
    } else {
      res.send(rows);
    } 
  });

});

router.get('/manage-products', (req, res) => {
  if (session.adminName == undefined) {
    res.redirect("/admin-login");
  } else {
    var getCategory = `Select * from category order by category_name asc`;
    conn.query(getCategory, (error, rows) => {
      if (error) {
        // console.log(error);
      }
      res.render('Products', { category: rows });
    });
  }

});

router.post('/update-subcategory', (req, res) => {
  var category = req.body.category;
  var subcategory = req.body.subcategory;
  var subcategoryID = req.body.subcategoryID;

  var updateSQL = `Update subcategory set Subcategory_name='${subcategory}' ,c_id =${category} where  subcategory_id=${subcategoryID}`;
  conn.query(updateSQL, (error) => {
    if (error) {
      res.send('error')
    } else {
      res.send('updated')
    };
  })
});

router.get('/show-sneaker/:id',(req,res)=>{
 var id=req.params.id
// console.log(id);
  var showsql = `SELECT * FROM products WHERE id=${id}`;
  conn.query(showsql)
  conn.query(showsql, (error,rows) => {
    if (error) {
     return res.send('error');
    } else {
      setTimeout(function() {
        res.render("showSneakers", {rows})
      },700);
// console.log(rows);
    }
  });


})


router.get('/delete-subcategory', (req, res) => {
  var id = req.query.id;
  var deletesql = `delete from subcategory where subcategory_id=${id}`;
  conn.query(deletesql, (error) => {
    if (error) {
      res.send('error');
    } else {
      res.send('deleted');
    }
  });

});
router.get('/fetch-subcategory-from-server', (req, res) => {
  var GetSql = `Select * from Subcategory order by subcategory_id desc`;
  var getid=`Select category_name from category`
  conn.query(GetSql, (error, rows) => {
    if (error) {
      res.send('error');
    } else {
      res.send(rows);
    }
  });
});
router.post('/add-subcategory', (req, res) => {
  var categoryID = req.body.category;
  var subcategory = req.body.subcategory;
  var insertsub = `insert into subcategory(Subcategory_name,c_id) value('${subcategory}',${categoryID})`;
  conn.query(insertsub, (error) => {
    if (error) {
      res.send('error');
    } else {
      res.send('added');
    }
  })

})


router.get('/sub-category', (req, res) => {
  if (session.adminName == undefined) {
    res.redirect("/admin-login");
  } else {

    var getCategory = `Select * from category order by category_name asc`;
    conn.query(getCategory, (error, rows) => {
      if (error) {
        // console.log(error);
      } else {
        res.render('sub_category', { category: rows });
      }
    });
  }

});

router.post('/del-category', (req, res) => {
  var catID = req.body.category_id;
  // console.log(req.body);
  // res.send('deleted');
  var DeleteCategory = `Delete from category where category_id=${catID}`;
  conn.query(DeleteCategory, (error) => {
    if (error) {
      res.send('error');
    }
    else {
      res.send('deleted');
    }

  });
});

router.post('/category-edit', (req, res) => {
  var categoryName = req.body.category;
  var categoryID = req.body.category_id;

  var editsql = `update category set category_name ="${categoryName}" where category_id=${categoryID}`;
  conn.query(editsql, (error) => {
    if (error) {
      res.send('error');
    }
    else {
      res.send('updated');
    }
  })
});


router.get('/get-category-from-server', (req, res) => {
  var selectCategory = `SELECT * FROM category`;
  conn.query(selectCategory, (error, data) => {
    if (error) {
      // console.log(error);
      res.send('error');
    } else {
      // console.log(data);
      res.send(data);
    }

  });

});

router.post("/category-add", (req, res) => {
  var category_name = req.body.category;
  var insertion = `INSERT INTO category(category_name) VALUES("${category_name}")`;
  conn.query(insertion, function (error) {
    if (error) {
      // console.log(error);
      res.send("error");
    }
    else {
      res.send("SUCCESS");
    }
  })
});


router.post("/User-login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  var loginSQL = `select * from users where username="${username}" and password="${password}"`;
  conn.query(loginSQL, (error, data) => {
    if (error) {
      res.send("error");
    }
    else {
      // console.log(data);
      if (data.length > 0) {
        session.fullname = data[0].Name;
        session.userName = username
        // console.log(session.fullname);
        res.send("success");
      } else {
        res.send("invalid");
      }
    }
  });

});
router.get("/User-login", (req, res) => {
  res.render("User_Login");
});
router.post("/User-Signup", (req, res) => {
  // console.log(req.body);
  var username = req.body.username;
  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  var confirmpass = req.body.confirmpass;
  var gender = req.body.gender;
  var address = req.body.address;

  if (username == "" || email == "" || name == "" || password == "" || confirmpass == "" || address == "") {
    res.send("empty");
  } else {
    if (password != confirmpass) {
      res.send("notMatched");
    } else {
      var selectSQL = `Select * from users where username="${username}"`;
      conn.query(selectSQL, (e, data) => {
        // console.log(data);
        if (e) {
          res.send("error");
        } else {
          if (data.length > 0) {
            res.send("userExist");
          }
          else {
            var insertuser = `Insert into users(username,password,email,name,gender,address) values("${username}","${password}","${email}","${name}","${gender}","${address}")`;
            conn.query(insertuser, (err) => {
              if (err) {
                res.send("error");
              }
              else {
                res.send("success");
              }
            });
          }
        }
      });


    }

  }

});
router.get("/About-US", (req, res) => {
  res.render("AboutUs")
});
router.get("/User-Signup", (req, res) => {
  res.render("User_Signup")
});
router.get("/category", (req, res) => {

  // res.render("category");
  if (session.adminName == undefined) {
    res.redirect("/admin-login");
  } else {
    res.render("category");
  }
});


// router.get("/Kids2", (req, res) => {
//   res.render('Kids2');
// })
// router.get("/Women2", (req, res) => {
//   res.render('Women2');
// })


router.get("/sneakers2", (req, res) => {
  var showsql = `SELECT * FROM products WHERE subcategory_id BETWEEN 7 AND 8 order by id desc; `
  var name= session.fullname;
  conn.query(showsql, (error,row) => {
    
    if (error) {
      return res.send('error');
    } else {
      res.render('sneakers2',{name});
      

// console.log(session.fullname);
    }
})
})


// router.get("/Kids", (req, res) => {
//   res.render('Kids');
// })
// router.get("/Women", (req, res) => {
//   res.render('Women');
// })


router.post("/sneakers",(req,res)=>{
// var action=req.body.action;
var item0=req.body.item;
var item=item0.toUpperCase()

if (item0=="all"){
  var selectSQL = ` SELECT * FROM products where subcategory_id in (select subcategory_id FROM subcategory where c_id=6)order by id desc`;
  conn.query(selectSQL, (error, rows) => {
    if (error) {
      res.send("error");  
    } else {
      res.send(rows);
    }
  });
}else{
  
var sql=`SELECT * from products where UPPER(Product_name) LIKE '%${item}%'`;
conn.query(sql, (error,row) => {
  if (error) {
   return res.send('error');
  } else {
    if(row.length===0){

      res.send("notFound")
    }
   else {

     res.send(row)
   }

    
  }
})
}
})

router.get("/sneakers", (req, res) => {
  res.render('sneakers');
})


/* GET home page. */
router.get('/', function (req, res, next) {
  
  var showsql = `SELECT * FROM products WHERE subcategory_id BETWEEN 7 AND 8 order by id desc; `;
  conn.query(showsql, (error,row) => {
    if (error) {
     return res.send('error');
    } else {
      res.render("index2", {row})
// console.log(rows);
    }
})
});

module.exports = router;
