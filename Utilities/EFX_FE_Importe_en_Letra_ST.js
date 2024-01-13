	/**
	 * EFX_POS_Util.js
	 * @NApiVersion 2.x
	 * @NModuleScope public
	 */

	define(function () {
		function Importe_en_Letra_ST(amount,idioma,symbol)
		{	
			var importe_Object 				= new Importe_en_Letra_Object();
			var importe_letra				= importe_Object.toWords(amount, idioma, symbol);
				importe_letra				= importe_letra.toUpperCase();


			return importe_letra;
			// return amount;

		}
		//--- Helpers ---
		function Importe_en_Letra_Object()
		{
			this.currencyLanguage = new Array();	
			initCurrencyLanguage(this.currencyLanguage);
			this.toWords = function(number, language, currency)
			{
				var words 		= new String();
				var objNumber 	= new DecimalNumber(number);
				switch(language)
				{
					case 'spanish':
					{
						words = AmountToSpanishWords(objNumber.integerPart.toString());
					};break;
					case 'english':
					{
						words = AmountToEnglishWords(objNumber.integerPart.toString());
					};break;
				}
				var objCurrLang 	= getCurrencyLanguage(this.currencyLanguage, language, currency);
				var pluralorsingle 	= objNumber.integerPart == 1 ? objCurrLang.single : objCurrLang.plural;		
				log.audit("objNumber", objNumber);
				log.audit("objNumber.decimalpart", objNumber.decimalPart.toString());
				var decimalpart 	= (objNumber.decimalPart < 10) ? "0" + objNumber.decimalPart.toString() : objNumber.decimalPart.toString();
				log.audit("decimalpart", decimalpart);
				words 				= words + ' ' + pluralorsingle + ' ' + decimalpart + "/100 " + objCurrLang.symbol;
				return words;
			};
		}
		function DecimalNumber(number)
		{

			this.number 		= number;
			log.audit("numberTEXT", number);
			this.integerPart 	= 0;
			this.decimalPart 	= 0;
			var arrnum 			= number.toString().split(".");
			log.audit("arrnum", arrnum);

			if (arrnum.length == 1)
			{
				this.integerPart = parseInt(arrnum[0], 10);
				this.decimalPart = 0;
			}
			else
			{
				if (!isNaN(arrnum[0]) == true)
				{
					this.integerPart = arrnum[0] * 1;
				}
				else
				{
					this.integerPart = 0;
				}
				if (!isNaN(arrnum[1]) == true)
				{
					log.audit("arranumTEXT", arrnum[1]);
					
					if(arrnum[1].length < 2){
						arrnum[1] += '0';
					}
					log.audit("beforeparseInt", arrnum[1]);
					this.decimalPart = arrnum[1] * 1; 
					log.audit("parseInt", this.decimalPart);
				}
				else{
					this.decimalPart = 0;
				}
			}	
		}
		function CurrencyLanguage(language, currency, symbol, plural, single)
		{
			this.language 	= language;
			this.currency 	= currency;
			this.symbol 	= symbol == null || symbol == "" ? currency : symbol;
			this.plural 	= plural; 
			this.single 	= single;
		}
		function initCurrencyLanguage(currencyLanguage)
		{
			
			currencyLanguage[0] 	= new Array();
			currencyLanguage[0][0] 	= new CurrencyLanguage("spanish", "MXN", "M.N.", "pesos", "peso");
			currencyLanguage[0][1] 	= new CurrencyLanguage("spanish", "USD", null, "dólares", "dólar");
			currencyLanguage[0][2] 	= new CurrencyLanguage("spanish", "EUR", null, "euros", "euro");
			currencyLanguage[0][3] 	= new CurrencyLanguage("spanish", "CAD", null, "dólares canadienses", "dólar canadiense");
			currencyLanguage[0][4] 	= new CurrencyLanguage("spanish", "JPY", null, "Yens", "Yen");
			currencyLanguage[0][5] 	= new CurrencyLanguage("spanish", "GBP", null, "libras esterlinas", "libra esterlina");

			currencyLanguage[1] 	= new Array();
			currencyLanguage[1][0] 	= new CurrencyLanguage("english", "MXN", null, "pesos", "peso");
			currencyLanguage[1][1] 	= new CurrencyLanguage("english", "USD", null, "dollars", "dollar");
			currencyLanguage[1][2] 	= new CurrencyLanguage("english", "EUR", null, "euros", "euro");
			currencyLanguage[1][3] 	= new CurrencyLanguage("english", "CAD", null, "canadian dollars", "canadian dollar");
			currencyLanguage[1][4] 	= new CurrencyLanguage("english", "JPY", null, "Yens", "Yen");
			currencyLanguage[1][5] 	= new CurrencyLanguage("english", "GBP", null, "pounds sterling", "pound sterling");

		}
		function getCurrencyLanguage(matrix, language, currency)
		{
			var objRet = null;	
			for(var i = 0; matrix != null && i < matrix.length; i++)
			{
				for(var j = 0; j < matrix[i].length; j++)
				{
					if(matrix[i][j].language == language && matrix[i][j].currency == currency)
					{
						objRet = matrix[i][j];
						break;
					}
				}
			}
			return objRet;
		}
		function AmountToEnglishWords(s)
		{
			var a 		= new String();
			var b 		= new String();
			var c 		= new String();
			var j 		= new String();
			var result 	= new String();
			if (s=='0') 
			{
				return ('zero');
			}
			if ((s.length % 3)>0)
			{
				s=' '+s;
			}
			if ((s.length % 3)>0)
			{
				s=' '+s;
			}
			for (var i = 0; i < s.length; i=i+3) 
			{
				j=s.length-i-1;
				a=s.substring(j, j+1);
				b=s.substring(j-1, j);
				c=s.substring(j-2, j-1);
				if (a!=' ')
				{
					if ((i==3)&(c+b+a!='000') ) {result='thousand '+result;}
					else if ((i==6)&(c+b+a!='000') ) {result='million '+result;}
					else if ((i==9)&(c+b+a!='000') ) {result='billion '+result;}
					else if ((i==12)&(c+b+a!='000') ) {result='trillion '+result;}
					else if ((i==15)&(c+b+a!='000') ) {result='quadrillion '+result;}
					else if ((i==18)&(c+b+a!='000') ) {result='quintillion '+result;}
					else if ((i==21)&(c+b+a!='000') ) {result='sextillion '+result;}
					else if ((i==24)&(c+b+a!='000') ) {result='septillion '+result;}
					else if ((i==27)&(c+b+a!='000') ) {result='octillion '+result;}
					else if ((i==30)&(c+b+a!='000') ) {result='nonillion '+result;}
					else if ((i==33)&(c+b+a!='000') ) {result='decillion '+result;}
					else if ((i==36)&(c+b+a!='000') ) {result='undecillion '+result;}
					else if ((i==39)&(c+b+a!='000') ) {result='duodecillion '+result;}
					else if ((i==42)&(c+b+a!='000') ) {result='tredecillion '+result;}
					else if ((i==45)&(c+b+a!='000') ) {result='quattuordecillion '+result;}
					else if ((i==48)&(c+b+a!='000') ) {result='quindecillion '+result;}
					else if ((i==51)&(c+b+a!='000') ) {result='sexdecillion '+result;}
					else if ((i==54)&(c+b+a!='000') ) {result='septendecillion '+result;}
					else if ((i==57)&(c+b+a!='000') ) {result='octodecillion '+result;}
					else if (i==60) {result='novemdecillion '+result;}
				}
				if ((b!='1') | (b==' '))
				{
					if (a==1){result='one '+result;}
					else if (a==2){result='two '+result;}
					else if (a==3){result='three '+result;}
					else if (a==4){result='four '+result;}
					else if (a==5){result='five '+result;}
					else if (a==6){result='six '+result;}
					else if (a==7){result='seven '+result;}
					else if (a==8){result='eight '+result;}
					else if (a==9){result='nine '+result;}
				}
				if ((b!=' ')&(b!='0'))
				{
					if (b=='1')
					{
						if (a==0){result='ten '+result;}
						else if (a==1){result='eleven '+result;}
						else if (a==2){result='twelve '+result;}
						else if (a==3){result='thirteen '+result;}
						else if (a==4){result='fourteen '+result;}
						else if (a==5){result='fifteen '+result;}
						else if (a==6){result='sixteen '+result;}
						else if (a==7){result='seventeen '+result;}
						else if (a==8){result='eighteen '+result;}
						else if (a==9){result='nineteen '+result;}
					}
					else
					{
						if (b==2){result='twenty '+result;}
						else if (b==3){result='thirty '+result;}
						else if (b==4){result='fourty '+result;}
						else if (b==5){result='fifty '+result;}
						else if (b==6){result='sixty '+result;}
						else if (b==7){result='seventy '+result;}
						else if (b==8){result='eighty '+result;}
						else if (b==9){result='ninety '+result;}
					}
				}
				if ((c!=' ')&(c!='0'))
				{
					if (c==1){result='one hundred '+result;}
					else if (c==2){result='two hundred '+result;}
					else if (c==3){result='three hundred '+result;}
					else if (c==4){result='four hundred '+result;}
					else if (c==5){result='five hundred '+result;}
					else if (c==6){result='six hundred '+result;}
					else if (c==7){result='seven hundred '+result;}
					else if (c==8){result='eight hundred '+result;}
					else if (c==9){result='nine hundred '+result;}
				}
			}
			result	= Trim(result);
			result	= FixSpaces(result);
			return (result);
		}
		function AmountToSpanishWords(s)
		{
			var a 		= new String();
			var b 		= new String();
			var c 		= new String();
			var j 		= new String();
			var orlen 	= new String();
			var result 	= new String();
			if (s=='0')
			{
				return ('cero');
			}
			orlen=s.length;
			if ((s.length % 3)>0)
			{
				s=' '+s;
			}
			if ((s.length % 3)>0)
			{
				s=' '+s;
			}
			for (var i = 0; i < s.length; i=i+3)
			{
				j=s.length-i-1;
				a=s.substring(j, j+1);
				b=s.substring(j-1, j);
				c=s.substring(j-2, j-1);
				if (a!=' ')
				{
					if ((i==3)&(c+b+a!='000') ) {result='mil '+result;}
					else if (((i==6)&(c+b+a!='000') ) &(orlen==7)&(a=='1')) {result='millon '+result;}
					else if ((i==6)&(c+b+a!='000') ) {result='millones '+result;}
					else if ((i==9)&(c+b+a!='000') ) {result='mil millones'+result;}
					else if (((i==12)&(c+b+a!='000') ) & (orlen==13)&(a=='1')) {result='billon '+result;}
					else if ((i==12)&(c+b+a!='000') ) {result='billones '+result;}
					else if ((i==15)&(c+b+a!='000') ) {result='mil billones'+result;}
					else if (((i==18)&(c+b+a!='000') )& (orlen==19)&(a=='1'))  {result='trillon '+result;}
					else if ((i==18)&(c+b+a!='000') ) {result='trillones '+result;}
					else if ((i==21)&(c+b+a!='000') ) {result='mil trillones '+result;}
					else if (((i==24)&(c+b+a!='000') )& (orlen==25)&(a=='1')) {result='quadrillon '+result;}
					else if ((i==24)&(c+b+a!='000') ) {result='quadrillones '+result;}
					else if ((i==27)&(c+b+a!='000') ) {result='mil quadrillones '+result;}
					else if (((i==30)&(c+b+a!='000') )& (orlen==31)&(a=='1')) {result='quintillon '+result;}
					else if ((i==30)&(c+b+a!='000') ) {result='quintillones '+result;}
					else if ((i==33)&(c+b+a!='000') ) {result='mil quintillones '+result;}
					else if (((i==36)&(c+b+a!='000') )& (orlen==37)&(a=='1')) {result='sextillon '+result;}
					else if ((i==36)&(c+b+a!='000') ) {result='sextillones '+result;}
					else if ((i==39)&(c+b+a!='000') ) {result='mil sextillones '+result;}
					else if (((i==42)&(c+b+a!='000') )& (orlen==43)&(a=='1')) {result='septillon '+result;}
					else if ((i==42)&(c+b+a!='000') ) {result='septillones '+result;}
					else if ((i==45)&(c+b+a!='000') ) {result='milseptillones '+result;}
					else if (((i==48)&(c+b+a!='000') )& (orlen==49)&(a=='1')) {result='octillon '+result;}
					else if ((i==48)&(c+b+a!='000') ) {result='octillones '+result;}
					else if ((i==51)&(c+b+a!='000') ) {result='mil octillones '+result;}
					else if (((i==54)&(c+b+a!='000') )& (orlen==55)&(a=='1')) {result='nonillon '+result;}
					else if ((i==57)&(c+b+a!='000') ) {result='nonillones '+result;}
					else if (i==60) {result='mil nonillones '+result;}
				}
				if ((b!=1 & b!=2) | (b==' '))
				{
					if (a==1){result='un '+result;}
					else if (a==2){result='dos '+result;}
					else if (a==3){result='tres '+result;}
					else if (a==4){result='cuatro '+result;}
					else if (a==5){result='cinco '+result;}
					else if (a==6){result='seis '+result;}
					else if (a==7){result='siete '+result;}
					else if (a==8){result='ocho '+result;}
					else if (a==9){result='nueve '+result;}
				}
				if ((b!=' ')&(b!='0'))
				{
					if ((b==1) | (b==2))
					{
						if (b+a==10){result='diez '+result;}
						else if (b+a==11){result='once '+result;}
						else if (b+a==12){result='doce '+result;}
						else if (b+a==13){result='trece '+result;}
						else if (b+a==14){result='catorce '+result;}
						else if (b+a==15){result='quince '+result;}
						else if (b+a==16){result='dieciseis '+result;}
						else if (b+a==17){result='diecisiete '+result;}
						else if (b+a==18){result='dieciocho '+result;}
						else if (b+a==19){result='diecinueve '+result;}
						else if (b+a==20){result='veinte '+result;}
						else if (b+a==21){result='veintiun '+result;}
						else if (b+a==22){result='veintidos '+result;}
						else if (b+a==23){result='veintitres '+result;}
						else if (b+a==24){result='veinticuatro '+result;}
						else if (b+a==25){result='veinticinco '+result;}
						else if (b+a==26){result='veintiseis '+result;}
						else if (b+a==27){result='veintisiete '+result;}
						else if (b+a==28){result='veintiocho '+result;}
						else if (b+a==29){result='veintinueve '+result;}
					}
					else
					{
						var temp='';
						if (a!=0){temp='y ';}
						if (b==3){result='treinta '+temp+result;}
						else if (b==4){result='cuarenta '+temp+result;}
						else if (b==5){result='cincuenta '+temp+result;}
						else if (b==6){result='sesenta '+temp+result;}
						else if (b==7){result='setenta '+temp+result;}
						else if (b==8){result='ochenta '+temp+result;}
						else if (b==9){result='noventa '+temp+result;}
						
					}
				}
				if ((c!=' ')&(c!='0'))
				{
					if ((a=='0') & (b=='0'))
					{
						if (c==1){result='cien '+result;}
						else if (c==2){result='doscientos '+result;}
						else if (c==3){result='trescientos '+result;}
						else if (c==4){result='cuatrocientos '+result;}
						else if (c==5){result='quinientos '+result;}
						else if (c==6){result='seiscientos '+result;}
						else if (c==7){result='setecientos '+result;}
						else if (c==8){result='ochocientos '+result;}
						else if (c==9){result='novecientos '+result;}
					}
					else
					{
						if (c==1){result='ciento '+result;}
						else if (c==2){result='doscientos '+result;}
						else if (c==3){result='trescientos '+result;}
						else if (c==4){result='cuatrocientos '+result;}
						else if (c==5){result='quinientos '+result;}
						else if (c==6){result='seiscientos '+result;}
						else if (c==7){result='setecientos '+result;}
						else if (c==8){result='ochocientos '+result;}
						else if (c==9){result='novecientos '+result;}
					}
				}
			}
			result  = FixSpaces(result);
			result 	= Trim(result);
			if (result.substring(0, 7)=='un mil ') 
			{
				result=result.substring(3,result.length);
			}
			if (result.substring(result.length-3, result.length)==' un') 
			{
				result=result+'o';
			}
			if (result=='un ')
			{
				result='uno';
			}
			if (result.substring(result.length-2, result.length)=='y ')
			{
				result=result.substring(0,result.length-2);
			}
			if (InStr(result, 'millones')!=RInStr(result, 'millones'))
			{
				var z=InStr(result, 'millones');
				result=result.substring(0,z-1)+result.substring(z+7,result.length);
			}
			if (InStr(result, 'billones')!=RInStr(result, 'billones'))
			{	var z=InStr(result, 'billones');
				result=result.substring(0,z-1)+result.substring(z+7,result.length);
			}
			if (InStr(result, 'trillones')!=RInStr(result, 'trillones'))
			{
				var z=InStr(result, 'trillones');
				result=result.substring(0,z-1)+result.substring(z+8,result.length);
			}
			if (InStr(result, 'quadrillones')!=RInStr(result, 'quadrillones'))
			{	
				var z=InStr(result, 'quadrillones');
				result=result.substring(0,z-1)+result.substring(z+11,result.length);
			}
			if (InStr(result, 'quintillones')!=RInStr(result, 'quintillones'))
			{
				var z=InStr(result, 'quintillones');
				result=result.substring(0,z-1)+result.substring(z+11,result.length);
			}
			if (InStr(result, 'sextillones')!=RInStr(result, 'sextillones'))
			{
				var z=InStr(result, 'sextillones');
				result=result.substring(0,z-1)+result.substring(z+10,result.length);
			}
			if (InStr(result, 'septillones')!=RInStr(result, 'septillones'))
			{
				var z=InStr(result, 'septillones');
				result=result.substring(0,z-1)+result.substring(z+10,result.length);
			}
			if (InStr(result, 'octillones')!=RInStr(result, 'octillones'))
			{
				var z=InStr(result, 'octillones');
				result=result.substring(0,z-1)+result.substring(z+9,result.length);
			}
			if (InStr(result, 'nonillones')!=RInStr(result, 'nonillones'))
			{	
				var z=InStr(result, 'nonillones');
				result=result.substring(0,z-1)+result.substring(z+9,result.length);
			}
			result = FixSpaces(result);
			return (result);
		}
		function InStr(n, s1, s2) 
		{
			var numargs=InStr.arguments.length;	
			if(numargs<3)
			{
				return n.indexOf(s1)+1;
			}
			else
			{
				return s1.indexOf(s2, n)+1;
			}
		}
		function RInStr(n, s1, s2)
		{
			var numargs=RInStr.arguments.length;	
			if(numargs<3)
			{
				return n.lastIndexOf(s1)+1;
			}
			else
			{
				return s1.lastIndexOf(s2, n)+1;
			}
		}
		function LTrim(s)
		{
			var i=0;
			for(i=0; i<=s.length-1; i++)
			{
				if(s.substring(i,i+1) != ' ')
				{
					j=i;
					break;
				}
			}
			return s.substring(j, s.length);
		}
		function RTrim(s)
		{
			var j=0;
			for(var i=s.length-1; i>-1; i--)
			{
				if(s.substring(i,i+1) != ' ')
				{
					j=i;
					break;
				}
			}
			return s.substring(0, j+1);
		}
		function Trim(s)
		{
			return LTrim(RTrim(s));
		}
		function FixSpaces(s)
		{
			var t='';
			for(var i=0; i<s.length; i++)
			{
				if (i>0)
				{
					if (!((s.substring(i-1,i)==' ')&(s.substring(i,i+1)==' ')))
					{
						t=t+s.substring(i,i+1);
					}
				}
				else
				{
					t=t+s.substring(i,i+1);
				}
			}
			return t;
		}
		function REPLICATE(n, c)
		{
			var t='';
			for(var i=1; i<=n; i++)
			{
				t=t+c;
			}
			return t;
		}
		return {
			importeLetra : Importe_en_Letra_ST
		}
	});
