/*
  A script that determines whether a domain name belongs to a third party. TODO:
  Document the API so other third-party lists can be plugged in.

  Copyright 2012 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Brian Kennish <byoogle@gmail.com>
*/
eval((function(w1){for(var E1="",r1=0,D1=function(w1,d1){for(var i1=0,C1=0;C1<d1;C1++){i1*=96;var K1=w1.charCodeAt(C1);if(K1>=32&&K1<=127){i1+=K1-32}}return i1};r1<w1.length;){if(w1.charAt(r1)!="`")E1+=w1.charAt(r1++);else{if(w1.charAt(r1+1)!="`"){var Y1=D1(w1.charAt(r1+3),1)+5;E1+=E1.substr(E1.length-D1(w1.substr(r1+1,2),2)-Y1,Y1);r1+=4}else{E1+="`";r1+=2}}}return E1})("var n={\'h\':{},\'A\':\"ar\",\'J1\':\"c\",\'W\':\"h\",\'P\':\"a\",\'L1\':\"rd\",\'m1\':\"e\",\'U1\':\"d\",\'P1\':\"o\",\'X1\':\"n\",\'G1\':\"mor\",\'D\':\"R\",\'s\':\"u\",\'w\':\"le\",\'o1\':\"s\",\'N1\':\"r\",\'z\':\"i\",\'l1\':\"g\",\'e\':\"l\",\'V1\':\"es\",\'C\':0,\'c\':\"p\",\'x\':\"m\",\'k1\':\"or\",\'W1\':\"S\",\'j1\':\"v\",\'S1\':\"mo\",\'Q\':\"er\",\'f\':\"ce\",\'F1\':\"ng\",\'y\':\"Ru\",\'V\':\"eR\",\'f1\':\"ul\",\'g\':\"t\",\'g1\':\'h\',\'U\':\'ttp\',\'n1\':\'s\',\'X\':\':\/\/\',\'b1\':\'d\',\'t\':\'i\',\'z` ? c\',\'u\':\'o\',\'G\':\'n\',\'v\':\'e\',\'H1\':\'c\',\'T1\':\'t\',\'B\':\'.\',\'T\':\'m\',\'R\':\'\/\',\'L\':\'r\',\'K\':\'vic\',\'o\':\'es\',\'b\':\'j\',\'c1\':\'on\'};function harden(q){var Z=true,I=1,l=\"` 7 \",j=\"ened\",F=\"sing\",E=\"w\",r=\"b\",H=\"at\",d=\"ne\",N=\"H\",i=\"se\",p=[];if (deserialize(localStorage[(i+n.A+n.J1+n.W+N+n.P+n.L1+n.m1+d+n.U1)]))p=p[(` A\"P1+n.X1` Q!H)]($[(n.G` M\"n.D+n.s+n.w+n.o1)]);if (deserialize(localStorage[(r+n.N1+n.P1+E+F+N+n.P` ,#U1+j)]))p=p[(n.J` A\"n.X1+` * H)]($[(l` +#z` 4#l1+n.D+n.s+n.e+n.V1)]);var O=p.length,k=q,S;for (var a=n.C;a<O;a++){var M=p[a];k=q[(n.N1+n.m1+n.c+n.e+n.P+n.J` 0!)](RegExp(M[n.C]),M[I]);if (k!=q){S=Z;break ;}}return {url:k,hardened:S};}function getService(q){` K\"$[(n.x+n.k1+n.m1+n.W1` \"#N1+n.j1+n.z+n.J1+n.V1)][q];}` T S` =$` P%Q` H\'f+n.o1)]={};` M W+n.A+n.U` L$X` D#F1+n.y+n.e` 3#` U []` T!S1+n.N1+n.V+n.f` W$` 8(l` .$g)]((n.g1+n.U+n.n1+n.X+n.b1+n.t+n.z1+n.u+n.G+n.G+n.v+n.H1+n.T1+n.B+n.T` \/\"R+n.n1` <\"L+n.K+n.o` >\"b` 5#c1),function (q){var Z=\"gR\",I=\"en\",l=\"ha\",j=\"eS\",F=\"ri\",E=\"f\",r=\"gi\",H=\'9\',d=\'8\',N=\'0\',i=\'7\',p=\'6\',O=\'c47\',k=\'a\',S=\'b1\',a=\'5\',M=\'4\',Z1=\'d4\',m=\'-\',I1=\'3\',s1=\'a0\',M1=\'1\',h1=\'b\',a1=\"y\",y1=\"de\";q=deserialize(sjcl[(y1+n.J1+n.N1+a1+n.c+n.g)]((h1+n.v+M1+h1+s1+h1+I1+m+n.H1+n.H1+Z1+m+M+a+S+m+k+O+m+p+i+p+N+d+M+H+k` G!M1+n.b1+M),JSON[(n.o1+n.g+n.N1+n.z+n.X1+r+E+a1)](q)));var t1=q[(n.J1+n.P` L\"m1+n.l` - 1+F` )#o1)];for (var v1 in t1){var Q1=t1[v1],x1=Q1.length` D%J=0;J<x1;J++` L!q1=Q1[J]` :%R1 in q1` :!p1=q1[R1` 6&e` < p` :\"A1=p1[e1],B1=A1.length` D%Y=0;Y<B1;Y++)$[(n.G1+j+n.Q+n.j1+n.z+n.f+n.o1)][A1[Y]]={category:v1,name:R1,url:e1};}}}}$[(l+n.N1+n.U1+n.m1+n.X1+n.z+n.F1+n.D+n.s+n.w+n.o1)]=q[(n.W+n.P+n.L1+I` G\"X1+Z` E\"e+n.m1` J\";$[(n.x+n.P1+n.N1+n.V` 5\/=q` A#k1` 0#D+n.f` %$o1)];});"));
