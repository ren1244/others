Date.prototype.toLocalStr=function(minute)
{
	this.setTime(minute*60000);
	return this.getFullYear()+"/"
		+("0"+(this.getMonth()+1)).slice(-2)+"/"
		+("0"+this.getDate()).slice(-2)+"-"
		+("0"+this.getHours()).slice(-2)+":"
		+("0"+this.getMinutes()).slice(-2);
}
Date.prototype.fromLocalStr=function(str)
{
	str=str.split('-');
	str[0]=str[0].split('/');
	str[1]=str[1].split(':');
	this.setSeconds(0);
	this.setMilliseconds(0);
	this.setDate(1);
	this.setFullYear(parseInt(str[0][0]));
	this.setMonth(parseInt(str[0][1])-1);
	this.setDate(parseInt(str[0][2]));
	this.setHours(parseInt(str[1][0]));
	this.setMinutes(parseInt(str[1][1]));
	return Math.floor(this.getTime()/60000);
}
Array.prototype.bsearch=function(val,func)
{
	var l,r,m,t;
	for(l=0,r=this.length-1;l+1<r;)
	{
		m=(l+r)>>>1;
		t=func(this[m],val);
		if(t>0)
			r=m;
		else if(t<0)
			l=m;
		else
			return m;
	}
	if(func(this[l],val)==0)
		return l;
	if(func(this[r],val)==0)
		return r;
	return -1;
}
