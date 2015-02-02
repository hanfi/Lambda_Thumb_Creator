console.log('Loading event');
var aws = require('aws-sdk');
var im = require('imagemagick');
var s3 = new aws.S3();

exports.handler = function(event, context) {
    console.log('Received event:');
    console.log(JSON.stringify(event, null, '  '));
    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    s3.getObject({Bucket:bucket, Key:key},
        function(err,data) {
            if (err) {
                console.log('error getting object ' + key + ' from bucket ' + bucket +
                '. Make sure they exist and your bucket is in the same region as this function.');
                context.done('error','error getting file'+err);
            }
            else {
                console.log('CONTENT TYPE:',data.ContentType);

                im.resize({srcData:data.Body,width:50},function(err,stdout,stderr){
                    if (err){
                        console.log('failed to resize the image '+err + " ----- stderr = "+stderr);
                        context.done(stderr,'Image Resize Failed');
                    }
                    else{
                        var thumbData = new Buffer(stdout, 'binary')
                        console.log('resize complete !!!');
                        s3.putObject({Bucket:bucket+"-target" , Key:"thumb_"+key , Body:thumbData},function(err){
                            if(err){
                                console.log('Image Upload failed: '+err+" ------ "+err.stack);
                                context.done(err,'Image Upload failed: '+err.stack);}
                            else{
                                console.log('Image Uploaded successfully');
                                context.done(data,'Image Uploaded successfully');}
                        })
                    }
                })
                console.log('EOF')
            }
        }
    );
};