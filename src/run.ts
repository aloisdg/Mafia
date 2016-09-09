const fs = require('fs')

function write(path: string, content: string): void {
    fs.writeFile(path, content, (err) => {
        if (err) throw err
        console.log('It\'s saved!')
    })
}

let d : string = ""

function read(): void {
    // const content: string = fs.readFile('liste_francais.txt', 'iso-8859-1', (err) => {
    // const content: string = fs.readFile('./converted.txt', 'utf8', (err, data) => {
    //     if (err) throw err
    //     console.log('It\'s opened!')
    //     // console.log(data);
    //     return data;
    // });
    // console.log(content)
    // return content

    fs.readFile('./converted.txt', 'utf8', (err, data) => {
        if (err) throw err
        let words : string = data;
        console.log(words.length);
        console.log(words);
    play(4, words.split('\n'), "./output/");
    });
}

function print(filePath: string, person: APerson): void {
    //         private static void Print(string filePath, APerson person)
    // {
    //     FileInfo file = new FileInfo(Path.Combine(filePath, Path.GetRandomFileName() + ".txt"));
    //     file.Directory.Create();
    //     File.WriteAllText(file.FullName, person.ToString());
    // }
    let path = Math.random().toString(36).substr(2, 5)
    write(filePath + '/' + path + ".txt", person.toString())
}


function play(playerCount: number, words: string[], path: string): void {   
    var game = new Game(words, playerCount);

    print(path, game.Story.Culprit)
    print(path, game.Story.Detective)
    print(path, game.Story.Recorder)
    game.Story.Mafiosos.forEach(person => print(path, person))
}




class Game {
    private wordCount: number = 3;
    public Words: string[]
    public PlayerCount: number

    public Story: Story

    // public Game() {}

    // public Game(IList<string> words, int playerCount)
    // {
    //     Words = words.ToList();
    //     PlayerCount = playerCount;

    //     // may remove this and let users call `game.New()` to start
    //     New();
    // }

    constructor(words: string[], playerCount: number) {
        this.Words = words;        
        this.PlayerCount = playerCount;

        this.New();
    }

    New(): void {
        let innocentWords = this.ExtractWords(this.Words);
        // console.log(innocentWords);
        
        let guiltyWords = this.ExtractWords(this.Words);
        // console.log(guiltyWords);
        
        this.Story = new Story(this.PlayerCount, innocentWords, guiltyWords);
    }


    private ExtractWords(words: string[]): string[] {
        
        let list = new Array<string>();
        for (let i = 0; i < this.wordCount; i++) {
            let index = Math.floor(Math.random() * words.length);
            let word = words[index];
            // console.log(word);
            // console.log(index);
            
            if (index > -1) { //useless
                words.splice(index, 1);
            }
            list.push(word);
        }
        return list;
    }

    // http://stackoverflow.com/questions/3404975/left-outer-join-in-linq
    //private static IEnumerable<T> Outersect<T>(IEnumerable<T> array1, IEnumerable<T> array2)
    //{
    //    return array1.Except(array2).Union(array2.Except(array1));
    //}
}

class APerson {
    Name: string
    Role: string
    Rule: string

    protected ToString():string{return ""}
    public toString():string{return this.ToString();}
}

class Recorder extends APerson {
    public InnocentWords: string[]
    public GuiltyWords: string[]

    constructor(innocentWords: string[], guiltyWords: string[]) {
        super()
        this.InnocentWords = innocentWords;
        this.GuiltyWords = guiltyWords;
        this.Role = "Greffier";
        this.Rule = "Vous etes connu de tous. Restez neutre !";
    }

    protected ToString(): string {
        return "Vous etes un " + this.Role + "\n" +
            this.Rule + "\n" +
            "Les mots des innocents sont : " + this.InnocentWords + "\n" +
            "Les mots du coupable sont : " + this.GuiltyWords;
    }
}

class Detective extends APerson {
    public Persons: AMafioso[]

    constructor(persons: AMafioso[]) {
        super()
        this.Persons = persons;
        this.Role = "Detective";
        this.Rule = "L'inspecteur doit trouver le coupable.";
    }

    protected ToString(): string {
        return `Vous etes le ${this.Role}\n${this.Rule}\n`;
        //String.Format("Les suspects sont : {0}", String.Join(" ", Persons.Select(x => x.Name)));
    }
}

class AMafioso extends APerson {
    public Words: string[]

    constructor(words: string[]) { super(); this.Words = words; }
}

class Culprit extends AMafioso {
    constructor(words: string[]) {
        super(words);
        this.Role = "Coupable";
        this.Rule = "Le coupable cherche à ne pas se faire accuser.";
    }

    protected ToString(): string {
        return `Vous etes le ${this.Role}\n${this.Rule}\nVos mots sont : ${this.Words}`
    }
}

class Complice extends AMafioso {
    constructor(words: string[]) {
        super(words)
        this.Role = "Complice";
        this.Rule = "Un complice cherche à couvrir le coupable.";
    }

    protected ToString(): string {
        return `Vous etes un ${this.Role}\n${this.Rule}\nVos mots sont : ${this.Words}`;
    }
}

class Story {
    // liste de crime https://fr.wikipedia.org/wiki/Liste_des_crimes_en_droit_fran%C3%A7ais
    // public string Description { get; set; }
    public InnocentWords: string[]
    public GuiltyWords: string[]

    public Recorder: Recorder
    public Culprit: Culprit
    public Detective: Detective
    public Mafiosos: AMafioso[]

    private Shuffle<T>(enumerable:T[]) : T[]
    {
            let array = new Array(...enumerable);
            for (var i = array.length; i > 1; i--)
            {
                var j = (Math.random() * i) | 0;

                var tmp = array[j];
                array[j] = array[i - 1];
                array[i - 1] = tmp;
            }
            return array;
    }

    constructor(playerCount: number, innocentWords: string[], guiltyWords: string[]) {
        this.InnocentWords = innocentWords;
        this.GuiltyWords = guiltyWords;

        // 3 for Recoder + culprit + detective

        this.Mafiosos = new Array<AMafioso>();

        for (let i = 0; i < playerCount - 3; i++) {
            this.Mafiosos.push(new Complice(innocentWords));
        }

        this.Culprit = new Culprit(guiltyWords);
        this.Recorder = new Recorder(innocentWords, guiltyWords);

        this.Mafiosos.push(this.Culprit);
        var crew = this.Mafiosos; // useless

        this.Detective = new Detective(this.Shuffle(crew));
    }
}

read();