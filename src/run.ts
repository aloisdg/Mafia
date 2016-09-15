const fs = require('fs')

function write(path: string, content: string): void {
    fs.writeFile(path, content, (err) => {
        if (err) throw err
        // console.log('It\'s saved!')
        console.log(content)
    })
}

function read(): void {
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
        let words: string = data
        console.log(words.length)
        play(4, words.split('\r\n'), "./output/")
    })
}

function print(filePath: string, person: APerson): void {
    let path = Math.random().toString(36).substr(2, 5)
    write(filePath + '/' + path + ".txt", person.toString())
}


function play(playerCount: number, words: string[], path: string): void {
    var game = new Game(words, playerCount);

    // print(path, game.Story.Culprit)
    print(path, game.Story.Detective)
    print(path, game.Story.Recorder)
    game.Story.Mafiosos.forEach(person => print(path, person))
}

class Game {
    private wordCount: number = 3;
    public Words: string[]
    public PlayerCount: number

    public Story: Story

    // public Game(IList<string> words, int playerCount)
    // {
    //     Words = words.ToList();
    //     PlayerCount = playerCount;

    //     // may remove this and let users call `game.New()` to start
    //     New();
    // }

    constructor(words: string[], playerCount: number) {
        this.Words = words
        this.PlayerCount = playerCount

        this.New()
    }

    New(): void {
        let innocentWords = this.ExtractWords(this.Words)
        let guiltyWords = this.ExtractWords(this.Words)

        this.Story = new Story(this.PlayerCount, innocentWords, guiltyWords)
    }

    private ExtractWords(words: string[]): string[] {
        let list = new Array<string>()
        for (let i = 0; i < this.wordCount; i++) {
            let index = Math.floor(Math.random() * words.length)
            let word = words[index]

            if (index > -1) { //useless ?
                words.splice(index, 1)
            }
            list.push(word)
        }
        return list
    }
}

// abstract
class APerson {
    Name: string
    Role: string
    Rule: string

    protected ToString(): string { return "" }
    public toString(): string { return this.ToString() }
}

class Recorder extends APerson {
    public InnocentWords: string[]
    public GuiltyWords: string[]

    constructor(innocentWords: string[], guiltyWords: string[]) {
        super()
        this.InnocentWords = innocentWords
        this.GuiltyWords = guiltyWords
        this.Role = "Greffier"
        this.Rule = "Vous etes connu de tous. Restez neutre !"
    }

    protected ToString(): string {
        return `Vous êtes un ${this.Role}. ${this.Rule}
Les mots des innocents sont : ${this.InnocentWords}.
Les mots du coupable sont : ${this.GuiltyWords}.`
    }
}

class Detective extends APerson {
    public Persons: AMafioso[]

    constructor(persons: AMafioso[]) {
        super()
        this.Persons = persons
        this.Role = "Detective"
        this.Rule = "Vous êtes connu de tous. L'inspecteur doit trouver le coupable."
    }

    protected ToString(): string {
        return `Vous êtes le ${this.Role}. ${this.Rule}`
        // String.Format("Les suspects sont : {0}", String.Join(" ", Persons.Select(x => x.Name)));
    }
}

class AMafioso extends APerson {
    public Words: string[]

    constructor(words: string[]) { super(); this.Words = words; }
}

class Culprit extends AMafioso {
    constructor(words: string[]) {
        super(words)
        this.Role = "Coupable"
        this.Rule = "Le coupable cherche à ne pas se faire accuser."
    }

    protected ToString(): string {
        return `Vous êtes le ${this.Role}.
${this.Rule}
Vos mots sont : ${this.Words}.`
    }
}

class Complice extends AMafioso {
    constructor(words: string[]) {
        super(words)
        this.Role = "Complice"
        this.Rule = "Un complice cherche à couvrir le coupable."
    }

    protected ToString(): string {
        return `Vous etes un ${this.Role}.
${this.Rule}
Vos mots sont : ${this.Words}.`
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

    private shuffle<T>(enumerable: T[]): T[] {
        let array = new Array(...enumerable)
        for (let i = array.length; i > 1; i--) {
            let j = (Math.random() * i) | 0
            let tmp = array[j]
            array[j] = array[i - 1]
            array[i - 1] = tmp
        }
        return array;
    }

    constructor(playerCount: number, innocentWords: string[], guiltyWords: string[]) {
        this.InnocentWords = innocentWords
        this.GuiltyWords = guiltyWords

        // 3 for Recoder + culprit + detective
        this.Mafiosos = new Array<AMafioso>()

        for (let i = 0; i < playerCount - 3; i++) {
            this.Mafiosos.push(new Complice(innocentWords))
        }

        this.Culprit = new Culprit(guiltyWords)
        this.Recorder = new Recorder(innocentWords, guiltyWords)

        this.Mafiosos.push(this.Culprit)
        let crew = this.Mafiosos // useless

        this.Detective = new Detective(this.shuffle(crew))
    }
}

read()