if (Meteor.isClient) {

  //Noniin vitun urpo. Huomaappa nyt että input.code tosiaan sitoo
  //tuon oikean metodin siihen nappiin joten on varsin kriittistä
  //että se on oikein määritelty. Saatana sentään. Piste, ei välilyönti.

  Template.rpsKlikker.events({
    'click input.rock': function(){
      Meteor.call('kivi');
    },

    'click input.paper': function(){
      Meteor.call('paperi');
    },

    'click input.scissors': function(){
      Meteor.call('sakset');
    },
    'click input.buy': function(event){
      Meteor.call('buy',event.target.id);
    }
  });

  Template.rpsKlikker.items = function(){
    return [{name: "Rock-fan", cost: 100}, {name: "Rolling rock", cost:200}]
  };

  Template.rpsKlikker.players = function () {
    return Meteor.users.find({}, {sort: {'points': -1}});
  };

  

  Meteor.subscribe('userData');

  Template.rpsKlikker.user = function(){
    return Meteor.user();
  };
}

//Seuraava osuus hallitsee serveripuolen tapahtumia.

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.setInterval(function() {
      Meteor.users.find({}).map(function(user) {
        Meteor.users.update({_id: user._id}, {$inc: {'points': user.rate}})
      });
    }, 500)
  });

  Accounts.onCreateUser(function(options, user){
    user.vastustaja = vaihdaArvo();
    user.points = 0.0;
    user.games = 0;
    user.rate = 0;
    user.pointMultiplier = 1;
    return user;
  });

  Meteor.publish("userData", function(){
    return Meteor.users.find({}, {sort:{'points': -1}});
  });
}

//Tämän jälkeen tulee metodeja joita rpsKlikker pystyy kutsumaan.
//KPS-funktiot hoitavat perusnapsuttelun.

Meteor.methods({
  kivi: function(){
    Meteor.users.update({_id: this.userId}, {$inc: {'games': 1}});
    if(Meteor.user().vastustaja == "scissors"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*3}, $set: {'vastustaja': vaihdaArvo()}});
    }else if(Meteor.user().vastustaja == "rock"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*1}, $set: {'vastustaja': vaihdaArvo()}});
    }else{
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*-1}, $set: {'vastustaja': vaihdaArvo()}});
      
    }
  },
  paperi: function(){
    Meteor.users.update({_id: this.userId}, {$inc: {'games': 1}});
    if(Meteor.user().vastustaja == "rock"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*3}, $set: {'vastustaja': vaihdaArvo()}});
    }else if(Meteor.user().vastustaja == "paper"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*1}, $set: {'vastustaja': vaihdaArvo()}});
    }else{
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*-1}, $set: {'vastustaja': vaihdaArvo()}});
    }
  },
  sakset: function () {
    Meteor.users.update({_id: this.userId}, {$inc: {'games': 1}});
    if(Meteor.user().vastustaja == "paper"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*3}, $set: {'vastustaja': vaihdaArvo()}});
      //Meteor.users.update({_id: this.userId}, {$set: {'pointMultiplier': 1, 'points': 0, 'games':  0}});
      
    }else if(Meteor.user().vastustaja == "scissors"){
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*1}, $set: {'vastustaja': vaihdaArvo()}});
    }else{
      Meteor.users.update({_id: this.userId}, {$inc: {'points': Meteor.user().pointMultiplier*-1}, $set: {'vastustaja': vaihdaArvo()}});
    }
  },
  buy: function(amount, id){
    if(Meteor.user().points>=amount && amount > 0){
      if(id == "Rock-fan"){
        Meteor.users.update({_id: this.userId}, {$inc: {'rate': 1, 'points': (0-amount)}});
      }else if(id == "Rolling rock"){
        Meteor.users.update({_id: this.userId}, {$inc: {'pointMultiplier': (1), 'points': (0-amount)}});
      }
    }
  },
});

create = function(){
    var id = Random.id();
    Meteor.call('create', id);
    return id;
}


function vaihdaArvo(){
      var i = Random.fraction();
      if(i<0.34){
        return("rock");
      }else if(i>=0.34 && i<0.67){
        return("paper");
      }else{
        return("scissors");
    };
};