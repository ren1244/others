/*
說明：
---------------------------------
函式
	ps2svg(ps_data,strokeTimes)
參數
	ps_data:ps圖檔資料
	strokeTimes:線條粗細倍率,預設為1
回傳值
	svg 元素
---------------------------------
函式
	appendPS(tag_id,ps_data,strokeTimes)
參數
	tag_id:作為容器的id，將產生的svg圖加到此容器上
	ps_data:ps圖檔資料
	strokeTimes:線條粗細倍率,預設為1
回傳值
	svg 元素
----------------------------------
函式
	zoomSVG(svg,times)
參數
	svg:要被縮放的svg元素
	times:縮放倍率
回傳值
	無
*/

function ps2svg(ps,lineTimes)
{
	if(!lineTimes)
		lineTimes=1;
	
	ps=ps.trim().split("\n");
	var i,n=ps.length,v,k;
	
	var cfg={};
	cfg['newpath']=function (a){
		if(a.length!=1)console.log('警告:newpath參數數量不合');
		path.newpath();
	}
	cfg['setlinewidth']=function (a){
		if(a.length!=2)console.log('警告:setlinewidth參數數量不合');
		path.setlinewidth(parseFloat(a[0]));
	}
	cfg['lineto']=function (a){
		if(a.length!=3)console.log('警告:lineto參數數量不合');
		path.lineto(parseFloat(a[0]),-parseFloat(a[1]));
	}
	cfg['stroke']=function (a){
		if(a.length!=1)console.log('警告:stroke參數數量不合');
		path.stroke();
	}
	cfg['moveto']=function (a){
		if(a.length!=3)console.log('警告:moveto參數數量不合');
		pos.x=parseFloat(a[0]);
		pos.y=-parseFloat(a[1]);
		path.moveto();
	}
	cfg['findfont']=function (a){
		if(a.length!=2)console.log('警告:findfont參數數量不合');
		text.findfont(a[0].substr(1));
	}
	cfg['setfont']=function (a){
		if(a.length!=3)console.log('警告:setfont參數數量不合');
		text.setfont(a[1],parseFloat(a[0]));
	}
	cfg['show']=function (a){
		var s=a.slice(0,a.length-1).join(" ");
		var p1=s.indexOf('(');
		var p2=s.lastIndexOf(')');
		text.show(s.substring(p1+1,p2));
	}
	cfg['showpage']=function (a){
		
	},
	cfg['%!']=function (a){
		
	}
	cfg['setdash']=function (a){
		var s=a.slice(0,a.length-1).join(" ");
		var p1=s.indexOf('[');
		var p2=s.lastIndexOf(']');
		var dash_arr=s.substring(p1+1,p2).trim().replace(/[\t ]+/g," ");
		dash_arr=dash_arr.length>0?dash_arr.split(" "):[];
		path.setdash(dash_arr,parseFloat(s.substring(p2+1).trim()));
	}
	var pos={x:-1,y:-1};
	var svg=(function (){
		var svgns="http://www.w3.org/2000/svg";
		var buf=document.createElementNS(svgns,"svg");
	return {//
		pushText:function (x,y,txt,fontName,fontSize){
			var p=document.createElementNS(svgns,"text");
			p.setAttributeNS(null,"style",'stroke:none;fill:black;font-family:'+fontName+';font-size:'+fontSize+'px');
			p.setAttributeNS(null,"x",x);
			p.setAttributeNS(null,"y",y);
			p.innerHTML=txt;
			buf.appendChild(p);
			
			
			//buf.push('<text x="'+x+'" y="'+y+'" style="stroke:none;fill:black;font-family:'+fontName+';font-size:'+fontSize+'px">'+txt+'</text>');
		},
		pushPath:function (arr,strokWid,dash_arr,dash_off){
			var p=document.createElementNS(svgns,"path");
			p.setAttributeNS(null,"style","fill:none;stroke:black;stroke-width:"+strokWid*lineTimes);
			p.setAttributeNS(null,"d",arr.join(""));
			if(dash_arr.length>0)
			{
				p.setAttributeNS(null,"stroke-dasharray",dash_arr.join());
				//console.log(dash_off);
				p.setAttributeNS(null,"stroke-dashoffset",dash_off);
			}
			buf.appendChild(p);
		},
		output:function (){
			var tmpdiv=document.createElement("div");
			document.body.appendChild(tmpdiv);
			tmpdiv.appendChild(buf);
			var bbx=buf.getBBox();
			buf.setAttributeNS(null,"width",Math.abs(bbx.width)+3);
			buf.setAttributeNS(null,"height",Math.abs(bbx.height)+3);
			buf.setAttributeNS(null,"viewBox",[bbx.x-1.5,bbx.y-1.5,Math.abs(bbx.width)+3,Math.abs(bbx.height)+3].join(" "));
			tmpdiv.removeChild(buf);
			//document.body.removeChild(tmpdiv);
			return buf;
		}
	};/**/})();
	var path=(function (){
		//property
		var strokWid=1;
		var dash_arr=[];
		var dash_off=0;
		
		var buf=[];
		var lto=false;
		var last_x=0;
		var last_y=0;
		var vec_x=0;
		var vec_y=0;
	return {//methods
		newpath:function (){
			buf=[];
			lto=false;
			last_x=0;
			last_y=0;
			vec_x=0;
			vec_y=0;
		},
		setlinewidth:function (wid){
			strokWid=wid;
		},
		stroke:function (){
			svg.pushPath(buf,strokWid,dash_arr,dash_off);
			path.newpath();
		},
		lineto:function (x,y){
			var vx,vy,inner_product,cross_product;
			if(!lto) //需要 move->line
			{
				lto=true;
				buf.push("M"+pos.x+","+pos.y);
				buf.push("L"+x+","+y);
				vec_x=x-pos.x;
				vec_y=y-pos.y;
				last_x=x;
				last_y=y;
			}
			else
			{
				if(x==last_x && y==last_y)
					return;
				if(vec_x!=0 || vec_y!=0)
				{
					vx=x-last_x;
					vy=y-last_y;
					inner_product=vx*vec_x+vy*vec_y;
					cross_product=vx*vec_y-vy*vec_x;
					if(cross_product==0 && inner_product>0)
					{
						buf[buf.length-1]=" "+x+","+y;
						last_x=x;
						last_y=y;
						return;
					}
				}
				buf.push(" "+x+","+y);
				vec_x=x-last_x;
				vec_y=y-last_y;
				last_x=x;
				last_y=y;
			}
		},
		moveto:function(){
			lto=false;
		},
		setdash:function (arr,off){
			dash_arr=arr;
			dash_off=off;
		}
	};/*methods end*/})(); 
	
	var text=(function (){
		//property
		var fontName;
		var fontSize;
	return {//methods
		findfont:function (fn){
			var fts=[];
			fts['Times-Roman']="'Times New Roman'";
			fts['Helvetica']='Helvetica';
			if(fts[fn]===undefined)
				console.log("warning:font name "+fn+" unmapped.");
			else
				fn=fts[fn];
			fontName=fn;
		},
		setfont:function (key,num){
			if(key!='scalefont')
			{
				console.log("error:unkonw setfont key "+key);
				return;
			}
			fontSize=num;
		},
		show:function (txt){
			svg.pushText(pos.x,pos.y,txt,fontName,fontSize);
		}
	};/*methods end*/})();
	
	
	for(i=0;i<n;++i)
	{
		v=ps[i].trim().replace(/[\t ]+/g," ").split(" ");
		k=v[v.length-1];
		if(cfg[k]===undefined)
		{
			console.log("警告:忽略參數 "+k);
			continue;
		}
		cfg[k](v);
	}
	return svg.output();
}
function appendPS(tag_id,ps_src,strokeTimes)
{
	if(!strokeTimes)
		strokeTimes=1;
	var svg=ps2svg(ps_src,strokeTimes);
	document.getElementById(tag_id).appendChild(svg);
	return svg;
}
function zoomSVG(svg,times)
{
	var vbx=svg.getAttributeNS(null,"viewBox").split(" ");
	svg.setAttributeNS(null,"width",vbx[2]*times);
	svg.setAttributeNS(null,"height",vbx[3]*times);
}
