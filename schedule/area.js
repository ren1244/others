area=[];
function init_area()
{
	var i;
	var d=new Date;
	for(i=0;i<area.length;++i)
	{
		area[i].d_from=d.fromLocalStr(area[i].d_from+"-00:00");
		area[i].d_to=d.fromLocalStr(area[i].d_to+"-00:00");
		area[i].t_from=conv(area[i].t_from);
		area[i].t_to=conv(area[i].t_to);
		area[i].step=conv(area[i].step);
	}
	function conv(str)
	{
		str=str.split(':');
		return parseInt(str[0])*60+parseInt(str[1]);
	}
}
function getTimeList()
{
	var arr=[];
	var i,ss,to,fac,dd;
	for(i=0;i<area.length;++i)
	{
		fac=area[i];
		for(dd=fac.d_from;dd<=fac.d_to;dd+=1440)
			for(t=fac.t_from;t<fac.t_to;t+=fac.step)
				arr.push({idx:i,time:dd+t});
	}
	arr.sort(function(a,b){return a.time==b.time?a.idx-b.idx:a.time-b.time});
	return arr;
}

function printAll(ArrObj)
{
	var i;
	var str="";
	var d=new Date;
	for(i=0;i<ArrObj.length;++i)
	{
		str+=ArrObj[i].idx+"\t"+d.toLocalStr(ArrObj[i].time)+"\n";
	}
	return str;
}
