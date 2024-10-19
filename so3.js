//	SO3.js
//	Requires animate.js included first

w=0;
h=0;
wc=0;
hc=0;
bg=null;

resized=false;
dpr = 1;

scale=0;
nCubesAcross=8;
cubeSpace=2.0/nCubesAcross;
spinAxis=null;
//palette=["#7F242D","#239B7A"," #FFD8B9","#FFFFEC","#CCCCCC","#193E4D"]; //sapy, teal e altri molto tumblr
//palette=["#CC0D99","#00FFFF","#80FF00","#FF7F00","#9900FF","#FF1A7D"] //psichedelici
//palette=["#5F1854","#8B104E","#1ABB9C","#F7F7F7","#FF6F61","#6A5ACD"] //bershka
//palette=["#25283D","#8F3985","#98DFEA","#07BB81","#C61E1E","#FFFFFF"] //bershka2
//palette=["#03045E","#F0F9FD","#00B4D8","#90E0EF","#CAF0F8","#B81111"] //sto decisamente perdendo troppo tempo
//palette=["#1B2651","#CD2028","#FFFFFF","#EDEAE1","#166C96","#DCAF61"] //tommy hilfiger
//palette=["#FF5E3A","#FF8C00","#FFD700","#FFCC00","#FF6F61","#D5006D"] //sunset
palette = ["#d3bfe8", "#bb8db3", "#78f4d9", "#b50808", "#cffbf2", "#ffffff"] //maybe this

F = 0;

customAnimate.initApp1 =
function ()
{
dpr=Math.min(Math.floor(window.devicePixelRatio || 1),2);
if (dpr > 1 && !resized)
	{
	canvas.style.width = canvas.width+"px";
	canvas.style.height = canvas.height+"px";
	canvas.width *= dpr;
	canvas.height *= dpr;
	resized = true;
	};
	
w=canvas.width;
h=canvas.height;
ctx=canvas.getContext('2d');
wc=w/2;
hc=h/2;

if (bg==null) bg=ctx.getImageData(0,0,w,h);
ctx.strokeStyle="#000000";
ctx.lineWidth=w/1000;

var sx=Math.random()-0.5;
var sy=Math.random()-0.5;
var sz=Math.random()-0.5;
var smag=Math.sqrt(sx*sx+sy*sy+sz*sz);
sx/=smag;
sy/=smag;
sz/=smag;
spinAxis=[sx,sy,sz];

scale=0.98*Math.min(wc,hc);

F = 0;
};


customAnimate.draw1 =
function (t)
{
ctx.putImageData(bg,0,0);

var b=[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
	[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
var c=[0,0,0];

//	b[8-15][0,1,2] are the (x,y,z) coordinates of the vertices of the "base" cube
//		for this frame, untranslated, and rotated according to the frame
//
//	(1-2*((i>>k)&1)) for i from 0-7 or 8-15 yields +/-1 for the kth coordinate
//		of the ith vertex, e.g. i = 000 binary is (-1,-1,-1)
//
//	The rotation matrix applied to this to rotate everything by an angle A
//	around the (unit) vector c[0,1,2] is
//
//	c[j]c[k](1-cos A) + I cos A + (c[i]sign{i,j,k}) sin A
//
//	(N.B. This looks counterclockwise, i.e. conventionally +ve for +ve A,
//	if you're looking in the direction c[])
//
//	(1-(j+4-k)%3) gives sign{3-j-k,j,k}
//
//	The factor of 3.464 is 2 Sqrt(3), to make each cube's diagonal equal
//	half the spacing between centres

var a=2.0*F/15;
var s1=Math.sin(a);
var c1=Math.cos(a);
for (var i=8;i<16;i++) for (var j=0;j<3;j++)
	{
	b[i][j]=0;
	for (var k=0;k<3;k++)
		b[i][j]+=(1-2*((i>>k)&1))*
				(cubeSpace/3.464)*
				((1-c1)*spinAxis[j]*spinAxis[k]+((j==k)?c1:(1-(j+4-k)%3)*s1*spinAxis[3-j-k]));
	};
	
//	c[0,1,2] are (x,y,z) of cube centres
//	dObs is the -ve distance from the observer (vp on line x=y=z)
//	r is the distance from the origin

//	for all cubes:

var e=1e-5;
var oneP=1.0+e;
var twoP=2.0+e;
var threeP=3.0+e;
for (var dObs=cubeSpace-3.0;dObs<=threeP;dObs+=cubeSpace)		// in order of -ve distance
	for (c[0]=-1;c[0]<=oneP && c[0]<=dObs+twoP;c[0]+=cubeSpace)	// for x varied
		if (c[0]>=dObs-twoP)								// if x not too low
		
			// for y varied, calculating z as we go
			
			for (c[1]=-1; c[1]<=oneP && (c[2]=dObs-c[0]-c[1])>=-oneP; c[1]+=cubeSpace)
				if (c[2]<=oneP &&					// if z not too high
													// if we lie within the sphere
					(r=Math.sqrt(c[0]*c[0]+c[1]*c[1]+c[2]*c[2]))<=oneP &&
					(c[0]<=e||c[1]<=e))				// and not in the cut-out wedge
	{
	//	b[0-7][0,1,2] are the coordinates of current cube, translated and
	//	rotated further
	
	r+=e;
	s=Math.sqrt(1-(a=Math.cos(Math.PI*r))*a);
	for (i=0;i<8;i++)
		for (j=0;j<3;j++)
			{
			b[i][j]=c[j];
			for(k=0;k<3;k++)
				b[i][j]+=b[8+i][k]*
					((1-a)*c[j]*c[k]/(r*r)+((j==k)?a:(1-(j+4-k)%3)*s*c[3-j-k]/r));
			};
	
	var baseDP=b[0][0]+b[0][1]+b[0][2];
	
	for (i=0;i<3;i++)		// for each coordinate direction, x, y, z
		{
		// select x, y or z bit of vertex to keep fixed
		// and make it -1 if our choice of 1 faces away
		// (coded in bits as making it 0 rather than 1)
							
		if (b[j=1<<i][0]+b[j][1]+b[j][2]<baseDP) j=0;
		
		//	for each corner of face, + one more for drawPolygon
		//	set the 2 other bits to select vertices of the face in turn:
		//		(k>>1)&1 is just the m.s.b.
		//		(k^(k>>1))&1 is l.s.b, but with order reversed when m.s.b.==1
		//		i+1 and i+2 modulo 3 give the shifts to put them in place
		//	Project (x,y,z) coordinates onto plane
		//	These formulae are the dot product with screen x- and y-
		//	basis vectors
		//		sx = (-sqrt[1/2],sqrt[1/2],0)
		//		sy = (sqrt[1/6],sqrt[1/6],-2sqrt[1/6])
		//	orthogonal to out-of-screen vector (sqrt[1/3],sqrt[1/3],sqrt[1/3])
		
		//	Draw the visible face
		
		ctx.fillStyle=palette[i+3*(j>>i)];
		ctx.beginPath();
		for (k=0;k<4;k++)
			{
			v=b[j|(((k>>1)&1)<<((i+1)%3))|(((k^(k>>1))&1)<<((i+2)%3))];
			x=wc+(scale*(0.707*(v[1]-v[0])));
			y=hc+(scale*(0.05+.408*(v[0]+v[1]-2*v[2])));
			if (k==0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
			};
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		
		};	// end for each coord direction
	};	// end for each cube
	
F++;
};
