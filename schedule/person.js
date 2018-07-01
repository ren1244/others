function personTable()
{
	this.data=[];
	//data=[{name,days,rec,rec_new},...]
	//days=[{from,to},...]
	//rec=[time_int,...]
	//rec_new=[{name,time},...]
}
personTable.prototype.init=function()
{//使用giveMeOne之前，rec內的東西要先排序好
	var i,j;
	var avg=0,count=0;
	for(i=this.data.length-1;i>=0;--i)
	{
		if(this.data[i].name[0]!='*')
		{
			this.data[i].rec.sort(function(a,b){return a-b;});
			avg+=this.data[i].rec.length;
			++count;
		}
	}
	avg=Math.round(avg/count);
	for(i=this.data.length-1;i>=0;--i)
		if(this.data[i].name[0]=='*')
		{
			this.data[i].name=this.data[i].name.slice(1);
			this.data[i].rec=[];
			for(j=0;j<avg;++j)
				this.data[i].rec.push(0);
		}
	//alert(JSON.stringify(this.data));
}
personTable.prototype.setProperty=function(idx,property,val)
{
	this.data[idx][property]=val;
}
personTable.prototype.push=function(Name,Vecation,Record)
{
	var t=this.data.length;
	this.data.push({idx:t,name:Name,days:Vecation,rec:Record,rec_new:[]});
}
personTable.prototype.sort=function(func)
{
	this.data.sort(func);
}
personTable.prototype.bsearch=function(val,func)
{
	return this.data.bsearch(val,func);
}
personTable.prototype.toStr=function()
{
	var i,j;
	var str="姓名\t休假時段\t先前排班\t本次班表\n";
	var d=new Date();
	for(i=0;i<this.data.length;++i)
	{
		str+=this.data[i].name+'\t';
		for(j=0;j<this.data[i].days.length;++j)
			str+=(j==0?'':',')+d.toLocalStr(this.data[i].days[j].from)+"~"+d.toLocalStr(this.data[i].days[j].to);
		str+='\t';
		for(j=0;j<this.data[i].rec.length;++j)
			str+=(j==0?'':',')+d.toLocalStr(this.data[i].rec[j]);
		str+='\t';
		for(j=0;j<this.data[i].rec_new.length;++j)
			str+=(j==0?'':',')+this.data[i].rec_new[j].name+" "+d.toLocalStr(this.data[i].rec_new[j].time);
		str+="\n";
	}
	return str;
}
personTable.prototype.reset=function()
{
	var i;
	for(i=this.data.length-1;i>=0;--i)
		this.data[i].rec_new.length=0;
}
personTable.prototype.giveMeOne=function(time_t,facName,flag)
{//選一個員工出來
	var dbg=""+(new Date().toLocalStr(time_t))+"\n";
	var i,len;
	var tmp=[],tmp_min=1<<30;
	var zoneOffset=(new Date().getTimezoneOffset());
	var rest=isRestTime(time_t);
	var today_s=((time_t-zoneOffset-360)/1440|0)*1440+360+zoneOffset;
	var today_e=today_s+1440;
	for(i=0;i<this.data.length;++i)
	{
		if(isAvailable(this.data[i]))
		{
			len=this.data[i].rec_new.length+this.data[i].rec.length;
			if(tmp_min==len)
				tmp.push(i);
			else if(tmp_min>len)
			{
				tmp_min=len;
				tmp=[i];
			}
		}
	}
	if(flag===true)
	{
		document .getElementById("test").value=tmp+"\n"+dbg;
	}
	if(tmp.length<=0)
		return -1;
	var ridx=tmp[parseInt(Math.random()*tmp.length)];
	this.data[ridx].rec_new.push({name:facName,time:time_t});
	return ridx;
	function isAvailable(p)
	{
		if(isVacation(p))
		{
			if(flag===true)
				dbg+=p.name+"\t假期中\n";
			return false;
		}
		var t=p.rec_new.length;//最後2筆資料
		t=t>=2?[p.rec_new[t-1].time,p.rec_new[t-2].time]
		:(t==1?[p.rec_new[t-1].time].concat(p.rec.slice(-1))
		:      p.rec.slice(-2));
		if(t.length<1) //無值班紀錄
		{
			if(flag===true)
				dbg+=p.name+"\t無值班紀錄\n";
			return true;
		}
		var countT=countToday(t);
		if(countT>=2) //已經排過2次班
		{
			if(flag===true)
				dbg+=p.name+"\t已經排過2次班\n";
			return false;
		}
		if(isRestTime(t[0]))
		{
			if(rest && countT>0) //連排休息時段
			{
				if(flag===true)
					dbg+=p.name+"\t假連排休息時段\n";
				return false;
			}
			if(t[0]%1440!=720 && time_t-t[0]<600) //夜休不足8小時
			{
				if(flag===true)
					dbg+=p.name+"\t夜休不足8小時\n";
				return false;
			}
		}
		if(time_t-t[0]<480) //休息不足6小時
		{
			if(flag===true)
				dbg+=p.name+"\t休息不足6小時\n";
			return false;
		}
		return true;
	}
	function isVacation(p)
	{
		var i;
		for(i=p.days.length-1;i>=0 && !(p.days[i].from<=time_t && time_t<p.days[i].to);--i);
		return i>=0;
	}
	function isRestTime(t)
	{
		var h=(t-zoneOffset)%1440; //h=時+分
		return (12*60==h || 22*60<=h || (0<=h && h<6*60))?true:false;
	}
	function countToday(arr)
	{//計算今天值班數
		var i,k;
		k=0;
		for(i=arr.length-1;i>=0;--i)
			if(today_s<=arr[i] && arr[i]<today_e)
				++k;
		return k;
	}
}
personTable.prototype.exportRec=function()
{//匯出檔案(紀錄用的)
	var i,j,t;
	var d=new Date;
	var arr=[],tmp=[];
	var len_min=1<<30,len;
	for(i=0;i<this.data.length;++i)
	{
		t=this.data[i];
		//更新len_min
		len=t.rec.length+t.rec_new.length;
		if(len_min>len)
			len_min=len;
		tmp=[];
		for(j=0;j<t.rec.length;++j)
			tmp.push(d.toLocalStr(t.rec[j]));
		for(j=0;j<t.rec_new.length;++j)
			tmp.push(d.toLocalStr(t.rec_new[j].time));
		arr.push(tmp);
	}
	len_min=len_min<2?0:len_min-2;
	for(i=0;i<arr.length;++i)
		arr[i]=this.data[i].name+"\t"+arr[i].slice(len_min).join(',');
	return arr.join('\n');
}
personTable.prototype.exportData=function()
{//匯出檔案(亂數排好的的)
	var i,j,t;
	var d=new Date;
	var str="";
	for(i=0;i<this.data.length;++i)
	{
		t=this.data[i].rec_new;
		str+=this.data[i].name+"\t";
		//寫入被排的工廠+時間
		for(j=0;j<t.length;++j)
			str=str.concat((j==0?'':','),t[j].name," ",d.toLocalStr(t[j].time));
		str+="\n";
	}
	return str;
}
