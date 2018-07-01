<?php
$arr=[];
foreach(scandir(__DIR__."/highlightJS/styles") as $v)
{
	if(substr_compare($v,".css",-4,4,true)==0)
		$arr[]=substr($v,0,-4);
}
//echo "<pre>".print_r($arr,true)."</pre>";
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>程式碼上色</title>
	<link href="main.css" rel="stylesheet" type="text/css">
	<?php if(count($arr)>0)
		echo '<link id="theme-css" rel="stylesheet" href="highlightJS/styles/'.$arr[0].'.css">';
	?>
	<script src="highlightJS/highlight.pack.js"></script>
</head>
<body>
	<div id="input-bar">
	tab轉換:<select id="tab">
			<option>1</option>
			<option>2</option>
			<option>3</option>
			<option selected>4</option>
			<option>8</option>
		</select>
	語言:<select id="lang">
			<option value="auto">自動偵測</option>
		</select> <span style="color:red;font-size:0.8em" id="lang-use"></span>
	風格:<select id="theme">
			<?php
				foreach($arr as $v)
					echo '<option value="highlightJS/styles/'.$v.'.css">'.$v.'</option>';
			?>
		</select>
		<button onclick="copyBBC()">複製為 BBCode</button>
	</div>
	<!--  -->
	<div class="content-row">
		<div class="content-col">
			<textarea id="input" class="auto_height"></textarea>
			<textarea id="bbcode" class="auto_height"></textarea>
		</div><div class="content-col">
			<pre  class="hljs auto_height"><code id="preview"></code></pre>
		</div>
	</div>
	<script src="main.js" type="text/javascript"></script>
</body>
</html>
