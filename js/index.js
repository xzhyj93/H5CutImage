var EventUtil = {
    addHandler: function(element, type, handler){
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        } else if(element.attachEvent){
            element.attachEvent("on"+type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
};

var postFile = {
    init: function(){
        var that = this;
        that.regional = document.getElementById('label');
        that.getImage = document.getElementById('get-image');
        that.editPic  = document.getElementById('edit-pic');
        that.editBox  = document.getElementById('cover-box');
        that.px = 0;            //实时预览区域的背景图片的坐标x
        that.py = 0;            //背景图片的y
        that.sx = 15;           //裁剪区域x
        that.sy = 15;           //裁剪区域y
        that.sHeight = 150;     //裁剪区域高度
        that.sWidth = 150;      //裁剪区域宽度
        EventUtil.addHandler(document.getElementById('post-file'), 'change', that.handleFiles);
        //document.getElementById('post-file').addEventListener("change",that.handleFiles, false);

        document.getElementById('save-btn').onclick = function(){
            that.editPic.height = that.sHeight;
            that.editPic.width = that.sWidth;
            var ctx = that.editPic.getContext('2d');
            var images = new Image();
            images.src = that.imgUrl;

            images.onload = function(){
                ctx.drawImage(images, that.sx, that.sy, that.sHeight, that.sWidth, 0, 0, that.sHeight, that.sWidth);
                document.getElementById('show-pic').getElementsByTagName('img')[0].src = that.editPic.toDataURL();
            };
        };
        //postFile.paintImage("img/aviary_heibai.jpg");

    },

    handleFiles: function(){
        var fileList = this.files[0];
        var oFReader = new FileReader();
        oFReader.onload = function(oFREvent){
            console.log(oFREvent);  
            postFile.paintImage(oFREvent.target.result);
        };
        oFReader.readAsDataURL(fileList);
    },

    //将图片按照原大小等比例重画
    paintImage: function(url){
        var that = this;
        var createCanvas = that.getImage.getContext("2d");
        console.log(that.getImage);
        var img = new Image();
        img.src = url;
        
        img.onload = function(){
            if(img.width < that.regional.offsetWidth && img.height < that.regional.offsetHeight){
                //获取图片的宽高
                that.imgWidth = img.width;
                taht.imgHeight = img.height;
            } else {
                //图片宽度/高度 * 区域高度
                var pWidth = img.width / (img.height / that.regional.offsetHeight);
                var pHeight = img.height/(img.width/that.regional.offsetWidth);

                //如果图片宽>高，则宽度设为区域宽度，否则设为pWidth
                that.imgWidth = img.width > img.height ? that.regional.offsetWidth : pWidth;
                that.imgHeight = img.height > img.width ? that.regional.offsetHeight : pHeight;
            }

            //裁剪区域x，y
            that.px = (that.regional.offsetWidth - that.imgWidth)/2 + 'px';
            that.py = (that.regional.offsetHeight - that.imgHeight)/2 + 'px';

            that.getImage.height = that.imgHeight;
            that.getImage.width = that.imgWidth;
            that.getImage.style.left = that.px;
            that.getImage.style.top = that.py;

            //document.getElementById("label").appendChild(img);
            createCanvas.drawImage(img,0,0,that.imgWidth,that.imgHeight);
            that.imgUrl = that.getImage.toDataURL();
            that.cutImage();
            that.drag();
        };
    },

    cutImage: function(){
        var that = this;

        that.editBox.height = that.imgHeight;
        that.editBox.width = that.imgWidth;
        that.editBox.style.display = 'block';
        that.editBox.style.left = that.px;
        that.editBox.style.top = that.py;

        var cover = that.editBox.getContext("2d");
        cover.fillStyle = "rgba(0,0,0,0.5)";
        cover.fillRect(0,0,that.imgWidth, that.imgHeight);
        cover.clearRect(that.sx, that.sy, that.sHeight, that.sWidth);

        var showEdit = document.getElementById('show-edit');
        showEdit.style.backgroundImage = 'url(' + that.imgUrl + ')' ;
        showEdit.style.backgroundRepeat = 'no repeat';
        showEdit.style.backgroundPosition = -that.sx + 'px ' + -that.sy + 'px';
        
        showEdit.style.height = that.sHeight + 'px';
        showEdit.style.width = that.sWidth + 'px'; 
        //console.log(showEdit.style.backgroundPosition);
    },

    drag: function(){
        var that = this;
        var draging = false;
        var startX = 0;
        var startY = 0;

        document.getElementById('cover-box').onmousemove = function(e){
            var e = e || window.event;  
            var pageX = e.pageX - (that.regional.offsetLeft + this.offsetLeft);
            var pageY = e.pageY - (that.regional.offsetTop + this.offsetTop);

            if(pageX > that.sx && pageX < that.sx + that.sWidth && pageY > that.sy && pageY < that.sy + that.sHeight){
                this.style.cursor = 'move';
                this.onmousedown = function(){
                    draging = true;

                    //记录上一次截图坐标
                    that.ex = that.sx;
                    that.ey = that.sy;

                    //记录鼠标按下时坐标
                    startX = e.pageX - (that.regional.offsetLeft + this.offsetLeft);
                    startY = e.pageY - (that.regional.offsetTop + this.offsetTop);

                };
                window.onmouseup = function(){
                    draging = false;
                };
                if(draging){
                    if(that.ex + (pageX - startX) < 0){
                        that.sx = 0;
                    } else if (that.ex + (pageX - startX) + that.sWidth > that.imgWidth) {
                        that.sx = that.imgWidth - that.sWidth;
                    } else {
                        that.sx = that.ex + (pageX - startX);
                    }

                    if(that.ey + (pageY - startY) < 0){
                        that.sy = 0;
                    } else if (that.ey + (pageY - startY) + that.sHeight > that.imgHeight) {
                        that.sy = that.imgHeight - that.sHeight;
                    } else {
                        that.sy = that.ey + (pageY - startY);
                    }
                    that.cutImage();
                } 
            } else {
                this.style.cursor = "auto";
            }
        };
    }
}

postFile.init();


