$("#productForm").validate({
    rules:{
        category:{
            minlength:2
        }
    },
    messages:{
        required:"Please Select Category",
    },
    submitHandler: function(form) {
      form.submit();
    }
   });