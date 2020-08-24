// Modified from https://raw.githubusercontent.com/kevinludwig/pgn-parser/master/src/grammar.peg
{
    interface PgnMove {
        moveNumber?: number;
        move?: string;
        nags?: string[];
        ravs?: PgnRav[];
        comments?: string;
    }

    interface PgnHeader {
        name: string;
        value: string;
    }

    interface PgnRav {
        moves: PgnMove[];
        result: string;
    }

    interface PgnGame {
        commentsAboveHeader: string;
        headers: PgnHeader[];
        comments: string;
        moves: PgnMove[];
        result: string;
    }

    function flatten<T>(a: Array<T | T[]>, acc: T[] = []): T[] {
        for (var i = 0; i < a.length; i++) {
            if (Array.isArray(a[i])) {
                flatten(a[i] as T[], acc);
            } else {
                acc.push(a[i] as T);
            }
        }
        return acc;
    }

    function make_header(hn: string, hv: string): PgnHeader {
        return {
            name: hn,
            value: hv
        };
    }

    function make_move(
        moveNumber: number,
        move: string,
        nags: string[],
        ravs: PgnRav[],
        comments: {text: string, command: string}[],
        comments2: {text: string, command: string}[]
    ): PgnMove {
        var m: PgnMove = {};
        if (moveNumber) m.moveNumber = moveNumber;
        if (move) m.move = move;
        if (nags && nags.length) m.nags = nags;
        if (ravs && ravs.length) m.ravs = ravs;
        if (comments.length) {
            m.comments = comments[0].text;
        }
        if (comments2.length) {
            m.comments = comments[0].text;
        }
        return m;
    }

    function make_rav(moves: PgnMove[], result: string): PgnRav {
        return {
            moves, 
            result
        };
    }

    function make_game(c0:string, hs:PgnHeader[], c1:string, m:PgnMove[], r:string): PgnGame {
        return {
            commentsAboveHeader: c0,
            headers: hs, 
            comments: c1,
            moves: m || [],
            result: r
        };
    }
}

start = gs:(game newline*)* EOF {return gs.map(function(g:string[]) { return g[0]})}

game = 
    whitespace*
    c0:comments?
    whitespace*
    h:headers? 
    c1:comments? 
    whitespace* 
    mr:(m:movetext whitespace+ r:result {return [m, r]} / r:result {return [null, r]}) 
    whitespace* {return make_game(c0, h, c1, mr[0], mr[1])}

EOF = !.
double_quote = '"'
string = double_quote str:[^"]* double_quote {return str.join('')}
integer = a:[1-9] b:[0-9]* {return parseInt(a+b.join(''), 10)}
symbol = chars:[A-Za-z0-9_-]+ {return chars.join('')}
blank = ' '
form_feed = '\f'
tab = '\t'
carriage_return = '\r'
line_feed = '\n'
ws = blank / form_feed / tab / carriage_return
whitespace = ws / newline
newline = line_feed

header = '[' hn:symbol ws+ hv:string ']' whitespace* { return make_header(hn,hv) }
headers = hs:header+ {return hs}

piece = [NKQRB]
rank = [a-h]
file = [1-8]
check = "+"
checkmate = "#"
capture = "x"
period = "."
result = "1-0" / "0-1" / "*" / "1/2-1/2"
move_number = mn:integer period? (period period)? {return mn}
square = r:rank f:file {return r+f}
promotion = "=" [QRBN]
nag = chars:("$" integer) {return chars.join('')}
nag_alts = "!!" / "??" / "!?" / "?!" / "!" / "?"
continuation = period period period
disambiguation = (rank file) / rank / file

multi_line_comment_chars = [^}]
multi_line_comment = "{" cc:multi_line_comment_chars* "}" {return cc.join('');}
single_line_comment_chars = [^\n]
single_line_comment = ";" cc:single_line_comment_chars* newline {return cc.join('');}
command_comment = '{' whitespace* cs:command+ whitespace* '}' {return cs;}
command = '[%' key:command_key whitespace+ values:command_values ']' {return {key, values};}
command_key = k:[a-zA-Z]+ {return k.join('');}
command_value = v:[^,\]]+ {return v.join('');}
command_values = first:command_value rest:(',' command_value)* {return rest ? [first, ...flatten(rest).filter(function (cv) { return cv !== ','})] : [first];}
comment = c:(command_comment / multi_line_comment / single_line_comment) {return typeof c === 'string' ? {text: c} : {commands: c};}
comments = (whitespace* cs:comment {return cs;})+

pawn_half_move = (r:rank c:capture)? square promotion?
piece_half_move = piece capture? square
piece_disambiguation_half_move = piece disambiguation capture? square
castle_half_move = ("O-O-O" / "O-O")

half_move = m:(continuation? 
    (castle_half_move / 
     piece_disambiguation_half_move / 
     piece_half_move / 
     pawn_half_move) 
    (check / checkmate)? 
    nag_alts?) {return flatten(m).join('');}

move = mn:move_number? 
       whitespace*
       m:half_move 
       nags:(whitespace+ n:nag {return n})*
       com:(whitespace+ c2:comment {return c2})* 
       ravs:(whitespace+ r:rav {return r})*
       com2:(whitespace+ c3:comment {return c3})* 
       {return make_move(mn, m, nags, ravs, com, com2)}

movetext = first:move rest:(whitespace+ move)* {return first ? [first].concat(rest.map(function(m: string[]) {return m[1]})) : []}

rav = "(" 
    whitespace* 
    m:movetext 
    whitespace* 
    r:result?
    whitespace*
    ")" {return make_rav(m, r)}
