<?php
//掃描 樣式資料夾所有 css 檔案並合併
//產生 theme.css 及 theme.js
$relative_path="highlightJS/styles";
$dir=__DIR__."/".$relative_path;

$arr=[];
$str=[];
foreach(scandir($dir) as $v)
{
	if(substr_compare($v,".css",-4,4,true)==0
		&& ($css=file_get_contents($dir."/".$v)))
	{
		
		$pfx=substr($v,0,-4);
		$pfx=str_replace(".","-",$pfx);
		$str[]=str_replace(".hljs",".".$pfx,$css);
		$arr[]=$pfx;
	}
}
echo "<pre>".print_r($str,true)."</pre>";
file_put_contents("theme.css",implode("\n",$str));
file_put_contents("theme.js",'var theme_data={"path":"'.$relative_path.'","css":["'.implode('","',$arr).'"]};');
