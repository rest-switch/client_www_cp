var DateCoder = {};

// 1362540074332 -> AGW84REK6
DateCoder.encode = function(date)
{
    // no date means now
    if(typeof(date) === 'undefined') date = Date.now();

    if(typeof(date) !== 'number') return(undefined);

    // input (dec):  1362540074332
    // input (date): Tue Mar 05 2013 22:21:14 GMT-0500 (EST)
    // input (hex):  13d3db7955c
    var hex = date.toString(16);

    // capture up to 60 bits                     --> 1 3d3db 7955c
    var s0 = hex.slice(-5);       // bits  0-19  --> 7955c
    var s1 = hex.slice(-10, -5);  // bits 20-39  --> 3d3db
    var s2 = hex.slice(-15, -10); // bits 40-59  --> 1

    var e0 = encode20(s0);  // REK6
    var e1 = encode20(s1);  // GW84
    var e2 = encode20(s2);  // 000A

    var result  = (e2 + e1 + e0);
    var resTrim = (result.replace(/^[0]+/g,''));  // AGW84REK6
    return(resTrim);
}

// AGW84REK6 -> 1362540074332
DateCoder.decode = function(encDate)
{
    if(typeof(encDate) !== 'string') return(undefined);
    if(encDate.length > 12) return(undefined);

    // decode up to 60 bits of base 32              --> A GW84 REK6
    var s0 = encDate.slice(-4);      // bits  0-19  --> REK6
    var s1 = encDate.slice(-8, -4);  // bits 20-39  --> GW84
    var s2 = encDate.slice(-12, -8); // bits 40-59  --> A

    var d0 = decode20(s0); if(typeof(d0) === 'undefined') return(undefined);  // 496988
    var d1 = decode20(s1); if(typeof(d1) === 'undefined') return(undefined);  // 250843
    var d2 = decode20(s2); if(typeof(d2) === 'undefined') return(undefined);  // 1

    var h0 = ('00000' + d0.toString(16)).slice(-5);  // 7955c
    var h1 = ('00000' + d1.toString(16)).slice(-5);  // 3d3db
    var h2 = d2.toString(16);                        // 1

    var hex = (h2 + h1 + h0);     // 13d3db7955c
    var dec = parseInt(hex, 16);  // 1362540074332

    return(isNaN(dec) ? undefined : dec);
}

// encodes 20 bits of hex to base32
function encode20(hexstr)
{
    // 5 bit encoding
//    var enc = '0ABCDEFGHJKMNPQRSTUVWXYZ12346789';  // conv O to 0
    var enc = '0abcdefghjkmnpqrstuvwxyz12346789';  // conv O to 0
    var num = parseInt(hexstr, 16);
    if(isNaN(num)) return(undefined);

    var c0 = enc[( num        & 0x1f)];
    var c1 = enc[((num >>  5) & 0x1f)];
    var c2 = enc[((num >> 10) & 0x1f)];
    var c3 = enc[((num >> 15) & 0x1f)];

    return(c3 + c2 + c1 + c0);
}

// decodes base32 to 20 bits of hex
function decode20(encstr)
{
    var dec =
    {
        '0':0,'o':0,'O':0,
        'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7,'H':8,'J':9,'K':10,'M':11,'N':12,'P':13,'Q':14,'R':15,'S':16,'T':17,'U':18,'V':19,'W':20,'X':21,'Y':22,'Z':23,
        'a':1,'b':2,'c':3,'d':4,'e':5,'f':6,'g':7,'h':8,'j':9,'k':10,'m':11,'n':12,'p':13,'q':14,'r':15,'s':16,'t':17,'u':18,'v':19,'w':20,'x':21,'y':22,'z':23,
        '1':24,'i':24,'I':24,'l':24,'L':24,
        '2':25,'3':26,'4':27,'6':28,'7':29,'8':30,'9':31,
        '5':16 // 5=S
    };

    var padencstr = ('0000' + encstr);
    var c0 = padencstr.slice(-1);
    var c1 = padencstr.slice(-2, -1);
    var c2 = padencstr.slice(-3, -2);
    var c3 = padencstr.slice(-4, -3);

    var d0 = dec[c0]; if(typeof(d0) === 'undefined') return(undefined);
    var d1 = dec[c1]; if(typeof(d1) === 'undefined') return(undefined);
    var d2 = dec[c2]; if(typeof(d2) === 'undefined') return(undefined);
    var d3 = dec[c3]; if(typeof(d3) === 'undefined') return(undefined);

    var result = (d0 | (d1 << 5) | (d2 << 10) | (d3 << 15));
    return(result);
}
