var list;
var log;
function run()
{
	var count=0;
	var holiday=[],history=[];
	log="";
	removeDownloadUrl(document.getElementById("output"));
	removeDownloadUrl(document.getElementById("record"));
	function f()
	{
		if(++count>=2)
		{
			setList(holiday[0],history[0]);
			getRandTable();
		}
	}
	var fs=document .getElementById("history").files;
	if(fs.length==0)
	{
		history.push("");
		++count;
	}
	else
		FilesReader(document .getElementById("history").files,history,f);
	FilesReader(document .getElementById("holiday").files,holiday,f);
}
function FilesReader(files,strarr,callback)
{
	var reader;
	reader=new FileReader();
	reader.onload=function(e)
	{
		strarr.push(e.target.result);
		callback();
	};
	reader.readAsText(files[0]);
}
function setList(holiday,history)
{
	var i,j,t,obj;
	var d=new Date();
	list=new personTable;
	area=[];
	//匯入人員資料
	holiday=holiday.split('\n');
	
	var reg=[/@[^\t]+\t[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}~[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}-[0-9]{1,2}:[0-9]{1,2}~[0-9]{1,2}:[0-9]{1,2}/g
			,/[^\t]+\t[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}-[0-9]{1,2}:[0-9]{1,2}~[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}-[0-9]{1,2}:[0-9]{1,2}/g
			,/[^\t]+\tnone/g];
	var mch;
	
	for(i=0;i<holiday.length;++i)
	{
		t=holiday[i].trim();
		if(t.length==0)
			continue;
		for(j=0;j<3;++j)
		{
			mch=t.match(reg[j]);
			if(mch!==null)
				break;
		}
		if(j>=3)
		{
			log+=t+"<br>";
			continue;
		}
		t=t.split('\t');
		if(j==0) //@工廠A(平日)	2017/6/11~2017/6/15-06:00~22:00
		{
			//{name,d_from,d_to,t_from,t_to,step=2}
			t[1]=t[1].split('-');
			t[1][0]=t[1][0].split('~');
			t[1][1]=t[1][1].split('~');
			area.push({name:t[0].slice(1),d_from:t[1][0][0],d_to:t[1][0][1],t_from:t[1][1][0],t_to:t[1][1][1],step:"02:00"});
		}
		else if(j==1)
		{//B	2017/6/13-18:00~2017/6/15-18:00,2017/6/20-18:00~2017/6/22-18:00
			t[1]=t[1].split(',');
			for(j=0;j<t[1].length;++j)
			{
				obj=t[1][j].split('~');
				t[1][j]={from:d.fromLocalStr(obj[0]),to:d.fromLocalStr(obj[1])};
			}
			list.push(t[0],t[1],[]);
		}
		else
			list.push(t[0],[],[]);
	}
	init_area();
	list.sort(function(a,b){return a.name>b.name?1:(a.name<b.name?-1:0);});
	//寫入值班紀錄
	history=conv(history,/[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}-[0-9]{1,2}:[0-9]{1,2}/g);
	for(i=0;i<history.length;++i)
	{
		t=list.bsearch(
			history[i][0],
			function(a,b){
				return a.name>b?1:(a.name<b?-1:0);
			});
		if(t<0)
			continue;
		for(j=0;j<history[i][1].length;++j)
		{
			history[i][1][j]=d.fromLocalStr(history[i][1][j]);
		}
		list.setProperty(t,'rec',history[i][1]);
	}
	list.init();
	function conv(str,reg)
	{//將原始資料轉換為[姓名,[日期資料]]，忽略不符合格式的資料
		var i,j,m;
		str=str.split('\n');
		for(i=str.length-1;i>=0;--i)
		{
			str[i]=str[i].split('\t');
			if(str[i].length!=2)
			{
				str.splice(i,1);
				continue;
			}
			str[i][1]=str[i][1].split(',');
			for(j=0;j<str[i][1].length;++j)
			{
				m=str[i][1][j].match(reg);
				if(m===null || m[0].length!=str[i][1][j].length)
				{
					break;
				}
			}
			if(j<str[i][1].length)
			{
				str.splice(i,1);
				continue;
			}
		}
		return str;
	}
}
function getRandTable()
{
	var tryMax=1000;
	var d=new Date();
	var count=0;
	var i,k;
	var fac=getTimeList(d.fromLocalStr("2017/06/08-00:00"),d.fromLocalStr("2017/06/14-00:00"));
	for(i=0;i<fac.length && count<tryMax;++i)
	{
		k=list.giveMeOne(fac[i].time,area[fac[i].idx].name);
		if(k<0)
		{
			i=0;
			list.reset();
			++count;
		}
	}
	if(count>=tryMax)
		alert("已嘗試亂數製表"+tryMax+"次，但找不到合法的排法");
	list.sort(function(a,b){return a.idx-b.idx});
	
	k=(Date.now()/1000|0);
	k=d.toLocalStr(k/60|0).replace(/\//g,"").replace(/:/g,"").replace(/-/g,"_")+("0"+k%60).slice(-2);
	
	refreshDownloadUrl(document .getElementById("output"),list.exportData(),"本次排班紀錄","排班紀錄"+k+".txt");
	refreshDownloadUrl(document .getElementById("record"),list.exportRec(),"本次狀態紀錄","status"+k+".txt");
	var out=list.toStr();//toStr exportData ();
	out="<table class='aaa'><tr><td>"+out.trim().replace(/\t/g,"</td><td>").replace(/\n/g,"</td></tr><tr><td>").replace(/\}\{/g,"}<br>{").replace(/,/g,"<br>")+"</td></tr></table>";
	document .getElementById("dbg").innerHTML=(log.length>0?"<h3>以下內容無法處理(已自動忽略)：</h3>"+log+"<hr>":"")+"<h3>輸出</h3>"+out;
	
	//追加輸出課表
	var arr=[];
	list.data.forEach(function(val,idx){
		val.rec_new.forEach(function(val2,idx2){
			arr.push({name:val.name,fac:val2.name,time:val2.time});
		});
	});
	out="";
	arr.sort(function(a,b){return a.fac==b.fac?a.time-b.time:a.fac<b.fac;});
	var fac_name=arr[k=0].fac;
	arr.forEach(function(val,idx){
		if(val.fac!=fac_name)
		{
			fac_name=val.fac;
			out+=exportTable(arr,k,idx);
			k=idx;
		}
	});
	out+=exportTable(arr,k,arr.length);
	document .getElementById("preview").innerHTML=out;
	//JSON.stringify(arr).replace(/},{/g,"<br>");
	function exportTable(arr,from,to)
	{
		var i,j,s,t,x,y;
		var tt=[],dd=[],te=[],tmp=[];
		var d=new Date;
		for(i=from;i<to;++i)
		{
			s=d.toLocalStr(arr[i].time);
			if(tt.indexOf(t=s.slice(-5))<0)
			{
				tt.push(t);
				te[t]=(d.toLocalStr(arr[i].time+120).slice(-5));
			}
			if(dd.indexOf(t=s.slice(5,10))<0)
				dd.push(t);
		}
		tt.sort();
		dd.sort();
		for(i=0;i<tt.length;++i)
		{
			tmp.push([]);
			for(j=0;j<dd.length;++j)
				tmp[i].push("");
		}
		for(i=from;i<to;++i)
		{
			s=d.toLocalStr(arr[i].time);
			y=tt.indexOf(s.slice(-5));
			x=dd.indexOf(s.slice(5,10));
			tmp[y][x]+=(tmp[y][x]==""?"":"\n")+arr[i].name;
		}
		s="<h3>"+arr[from].fac+"</h3><table class='aaa'><tr><td></td><td>"+dd.join('</td><td>')+"</td></tr>";
		tmp.forEach(function(val,idx){
			s+="<tr><td>"+tt[idx]+"~"+te[tt[idx]]+'</td><td>'+val.join('</td><td>')+"</td></tr>";
		});
		s+="</table>";
		return s;
	}
}
function removeDownloadUrl(aTag_ref)
{
	aTag_ref .removeAttribute("href");
	aTag_ref .innerHTML="";
}
function refreshDownloadUrl(aTag_ref,out_str,LinkName,FileName)
{
	var blob=new Blob([out_str],{type:"text/plain"});
	var blobUrl=URL.createObjectURL(blob);
	aTag_ref .setAttribute("href",blobUrl);
	aTag_ref .setAttribute("download",FileName);
	if(typeof LinkName == "string")
		aTag_ref.innerHTML=LinkName;
	else
		aTag_ref .appendChild(LinkName);
}
