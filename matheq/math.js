document.addEventListener("DOMContentLoaded",function (evt){
	document.addEventListener("change",initOnChangeInput());
	document.addEventListener("keyup",initOnChangeInput());
});

function initOnChangeInput()
{
	var out=document.getElementById("output");
	var inp=document.getElementById("input");
	var ts=0,delay=300,flag=false;
	return function(evt)
	{
		ts=Date.now();
		if(!flag)
		{
			flag=true;
			setTimeout(proc0,delay);
		}
	}
	function proc0()
	{
		flag=false;
		var t=Date.now();
		if(t-ts>=delay)
		{
			out.innerHTML=inp.value.replace(/\\\[/g,'<div class="eq-ib">\\[').replace(/\\\]/g,'\\]</div>');
			MathJax.Hub.Typeset();
		}
		else
		{
			flag=true;
			setTimeout(proc0,t+delay-ts);
		}
	}
}
