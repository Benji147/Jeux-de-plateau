
const armurerie = [
    ["couteau",10],
    ["pistolet",20],
    ["fusil",40],
    ["AK47",60],
    ["rocket",80]];
const personnages = ["HawkEyes","BlackWidow"];                   

class Outils {

    constructor() {
        this.indexRes = []; 
    }

    entierAleatoire(max) {
        return Math.floor(Math.random() * max);
    }

    compareIndex(t1,t2) {
        return t1 === t2;
    }

    nouvelleIndex() {
        let index;
        do {
            index = this.entierAleatoire(100);
        }
        while (this.indexRes.filter(e => this.compareIndex(e, index)).length !== 0);
        this.indexRes.push(index);
        return index; 
    }


    selectElement(x, y) {
        return $(`#x${x}-y${y}`);
    }

    isNear(element1, element2) {
        return element1.position[0] === element2.position[0] && element1.position[1] === element2.position[1] ||
            element1.position[0] === element2.position[0] && element1.position[1] === element2.position[1] + 1 ||
            element1.position[0] === element2.position[0] && element1.position[1] === element2.position[1] - 1 ||
            element1.position[0] === element2.position[0] + 1 && element1.position[1] === element2.position[1] ||
            element1.position[0] === element2.position[0] - 1 && element1.position[1] === element2.position[1];
    }
}

const outils = new Outils();

class Carte {
    constructor() {
        this.cases = [];
        this.combattants = [];
        this.drawCarte();
        this.drawMurs();
        this.drawArmes();
        this.drawCombattants();
        this.choixCombattant();
        this.infoJoueur();
        this.nbrePas = 0;
        $(document).keydown(e => this.deplacementListener(e));
    }

    drawCarte() {    
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const position = [x, y];
                const case_tmp = new Case(position);
                this.cases.push(case_tmp);
                $("#cadre").append(`<span id="x${case_tmp.position[1]}-y${case_tmp.position[0]}"></span>`);
            }
        }
    }

    drawMurs() {
        for(let i = 0; i < 20; i++) {
            const index_case = outils.nouvelleIndex();
            this.cases[index_case].mur = true;
            const x = this.cases[index_case].position[0];
            const y = this.cases[index_case].position[1];
            let positionMur = outils.selectElement(x, y);
            positionMur.append('<img class="mur" id="mur" src="mur.png">');
        }
    }

    drawArmes() {
        for (let i = 1; i < armurerie.length; i++) {
            const index_case = outils.nouvelleIndex();
            this.cases[index_case].arme = new Arme(armurerie[i][0],armurerie[i][1]);
            const x = this.cases[index_case].position[0];
            const y = this.cases[index_case].position[1];
            let positionArme = outils.selectElement(x, y);
            let arme = this.cases[index_case].arme.nomArme;
            positionArme.append(`<img class="arme" id="${arme}" src="${arme}.png">`);
        }     
    }

    drawCombattants() {  
        for (let i = 0; i < personnages.length; i++ ) {
            const index_case = outils.nouvelleIndex();
            this.combattants.push(new Combattant(personnages[i],100,this.cases[index_case].position,new Arme(armurerie[0][0],armurerie[0][1])));
        }
        if (outils.isNear(this.combattants[0],this.combattants[1])) {
            const index_case = outils.nouvelleIndex();
            this.combattants[1].position = this.cases[index_case].position;
        }
        for (let i = 0; i < 2; i++) {
            const x = this.combattants[i].position[0];
            const y = this.combattants[i].position[1];
            let positionCombattant = outils.selectElement(x, y);
            let player = this.combattants[i].nomPlayer; 
            positionCombattant.append(`<img class="combattant" id="${player}" src="${player}.png">`); 
        }  
    }

    infoJoueur() {
        $('#armeBlack').html(`<img src="${this.combattants[0].inventory.nomArme}.png">`);
        $('#armeHawk').html(`<img src="${this.combattants[1].inventory.nomArme}.png">`);
    }

    choixCombattant() {
        let choixPlayer;
        do {
            choixPlayer = Number(prompt("Quel est le personnage qui doit se déplacer ?  Choix 1 : HawkEyes, Choix 2 : BlackWidows Choix 3 : sortir")); 
        } while(!(choixPlayer >= 1 && choixPlayer <= 3));
        if (choixPlayer === 3) {
            alert("Merci et à bientôt");
        }
        else {this.player = this.combattants[choixPlayer-1];}

    }

    testCollisionMur(coord) {
        return !this.cases[Number(`${coord[0]}${coord[1]}`)].mur;
    }

    testCollisionArme(coord) {
        return this.cases[Number(`${coord[0]}${coord[1]}`)].arme;
    }

    testCollisionCombattant() {
        if (outils.isNear(this.combattants[0],this.combattants[1])) {
            if (this.player === this.combattants[0]) {
                this.combattants[0].combat(this.combattants[1]);
            }
            this.combattants[1].combat(this.combattants[0]);  
        }
    }

    changePlayer(player) {
        if (player === 0) {
            this.player = this.combattants[1];
        } else {
            this.player = this.combattants[0];
        }  
        return;
    }

    deplacementListener(e) {
        const key = e.which;
        let player = this.player;
        const indexPlayer = this.combattants.indexOf(this.player);
        let [posX,posY] = player.position;
        if (this.nbrePas < 3) {
            if (key === 37 && posX > 0) {
                posX -= 1;
            } else if (key === 40 && posY < 9) {
                posY += 1;
            } else if (key === 39 && posX < 9) {
                posX += 1;
            } else if (key === 38 && posY > 0) {
                posY -= 1;
            } else if (key === 13) {
                alert("Changement de joueur!!");
                this.changePlayer(indexPlayer);
                this.nbrePas = 0;
            }
            if (this.testCollisionMur([posX,posY])) {
                player.position = [posX,posY];
                player.deplacer();
                this.nbrePas++;
            }
            if(this.testCollisionArme([posX,posY])) {
                let indexArmeSurCase = Number(`${posX}${posY}`);
                let armeSurCase = this.cases[indexArmeSurCase].arme;
                const armeTmp = this.player.inventory;
                this.player.inventory = armeSurCase;
                this.cases[indexArmeSurCase].arme = armeTmp;
                player.laidArme(armeTmp);
            }
            this.testCollisionCombattant();
        } else {
            alert("Changement de joueur!!");
            this.changePlayer(indexPlayer);
            this.nbrePas = 0;
        }
    }


}

class Case {
    constructor(position) {
        this.position = position;
        this.mur = false;
        this.arme = null;  
    }
}

class Combattant {
    constructor(nomPlayer, health, position, inventory, statut) {
        this.nomPlayer = nomPlayer;
        this.health = health;
        this.position = position;
        this.inventory = inventory;
        this.statut = statut;
    }

    modificationInfoArme(player) {
        if (player.nomPlayer === "BlackWidow") {
            return "armeBlack";
        }
        return "armeHawk";
    }

    deplacer() {
        $(`#${this.nomPlayer}`).remove();
        let positionCombattant = outils.selectElement(this.position[0],this.position[1]);
        positionCombattant.append(`<img class="combattant" id="${this.nomPlayer}" src="${this.nomPlayer}.png">`);    
    }

    laidArme(arme) {
        let infoInventaire = this.modificationInfoArme(this);
        $(`#${this.inventory.nomArme}`).remove();
        $("#" + infoInventaire).html(`<img src="${this.inventory.nomArme}.png">`);
        let positionArme = outils.selectElement(this.position[0], this.position[1]);
        positionArme.append(`<img class="arme" id="${arme.nomArme}" src="${arme.nomArme}.png">`);  
    }

    attaque(player) {
        this.statut = "attaque";
        let damage = this.inventory.degat;
        if (player.statut === "defense") {
            player.health -= damage / 2;
        } else {
            player.health -= damage;
        }
        alert(`${player.nomPlayer} a ${player.health} points de vie`);
    }  

    combat(player) {
        let playerDonne = this;
        let playerRecoit = player;
        let playerTmp;
        this.attaque(player);
        while (playerDonne.health > 0 && playerRecoit.health > 0) {
            let choixCombat = prompt(`${playerRecoit.nomPlayer} que veux-tu faire maintenant ? 1 : Attaquer ou 2 : défendre`)
            switch (choixCombat) {
                case "1" : 
                    playerRecoit.attaque(playerDonne);
                    break;
                case "2" :
                    playerRecoit.statut = "defense";
                    break;
                default : 
                    alert("Erreur de saisie");
                    return;       
            }
            playerTmp = playerDonne;
            playerDonne = playerRecoit;
            playerRecoit = playerTmp;
        }
        if (playerRecoit.health <= 0) {
            alert(`La partie est terminée ${playerRecoit.nomPlayer} est mort, pour rejouer merci d'actualiser la page`);
        } else {
            alert(`La partie est terminée ${playerDonne.nomPlayer} est mort, pour rejouer merci d'actualiser la page`);
        }
    }
}

class Arme {
    constructor(nomArme, degat) {
        this.nomArme = nomArme;
        this.degat = degat;
    }
}

new Carte();

