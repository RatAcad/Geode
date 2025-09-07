    let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;
    
    let app = new Application({
        antialiasing: true,
        transparent: true,
        width: 1600,
        height: 900,
        resolution: 1
      }
   );

	var gameWindow = document.getElementById("gameWindow");
	gameWindow.appendChild(app.view);
	var size = [1600, 900];
	var ratio = size[0] / size[1];


	resize()
	function resize() {
	    if (window.innerWidth / window.innerHeight >= ratio) {
	        var w = window.innerHeight * ratio;
	        var h = window.innerHeight;
	    } else {
	        var w = window.innerWidth;
	        var h = window.innerWidth / ratio;
	    }
	    app.renderer.view.style.position = 'absolute';
	    app.renderer.view.style.width = w + 'px';
	    app.renderer.view.style.height = h + 'px';
	    //app.renderer.view.style.top = '10%';
	    app.renderer.view.style.left = '5%';
	    app.renderer.view.style.bottom = '0%'; 
	    //app.renderer.view.style.margin = -w/2 + 'px 0 0 ' -h/2 + 'px';    
	}
	window.onresize = resize;


    var flashStage = new PIXI.Container();
    var gameScene = new PIXI.Container();
    var miniMapScene = new PIXI.Container();

    //First, Create a Pixi renderer and stage
   // var renderer = PIXI.autoDetectRenderer(512, 512);
   // document.body.appendChild(renderer.view);
     
    //Next, create a new instance of Smoothie
    var smoothie = new Smoothie({
      engine: PIXI,
      renderer: app,
      root: gameScene,
      update: gameLoop.bind(this),
      fps: 50,
    });
    var STEPPING_FRAMES = [];
    var WALKING_FRAMES = [];
    var SHADOW_RUNNING_FRAMES = [];

    var MAIN_LIGHT_IDLE_FRAMES = [];
    var BRIGHT_GEM_LEFT_CORRECT_FRAMES = [];
    var BRIGHT_GEM_RIGHT_CORRECT_FRAMES = [];
    var BRIGHT_GEM_LEFT_DROP_FRAMES = [];
    var BRIGHT_GEM_RIGHT_DROP_FRAMES = [];
    var FADE_FRAMES = [];
    var SIDELIGHT_FRAMES = [];
    var BIOMES_FOREGROUND = [];
    var BIOMES_BACKGROUND = [];
    var MINIMAPS = [];
    /*
    Here's what those options above mean:
    - `renderingEngine`: the PIXI global object.
    - `renderer`: The `renderer` object you created using Pixi's `autoDetectRenderer`
    - `root`: The `stage` Container object at the top of Pixi's sprite display list heirarchy
    - `updateFunction`: A function, containing your game or application logic, that you want to run in a loop.
    In this example it's the function caled `update` that you'll see ahead in this file.
    Importantly, use `bind(this)` to bind the function to the current application scope.
    - `fps`: The frames-per-second that you want your animation to run at. The default is 60.

    There are other options you could supply:
    - `properties`: An object that defines 5 Boolean sprite properties for which you want
    smooth animation: `position`, `rotation`, `scale`, `size`, `alpha`.
    Set them to `true` to turn them on, and `false` to turn them off. If you leave the `properties` option out,
    Smoothie will automatically give you smooth animation for position and rotation.
    - `interpolate`: A Boolean (true/false) value that determines whether animation smoothing (interpolation) should be on or off.
    */

    //Load any assets you might need and call the `setup` function when
    //they've finished loading

    PIXI.loader
      .add("images/character_bag_static.png")
      .add("images/background_front_1.png")
      .add("images/background_back_1.png")
      .add("images/brightgem_left_static.png")
      .add("images/brightgem_right_static.png")
      .add("images/DullLeftGem.png")
      .add("images/DullRightGem.png")
      .add("images/sidelight_static.png")
      .add("images/SideDoor.png")
      .add("images/flashlightbeam_1.png")
      .add("images/xmark_1.png")
      .add("images/points_icon.png")
      .add("images/character_silhouette.png")
      .add("images/Thankyou.png")
      .load(setup);

    //ADD ALL THE ANIMATIONS
    addSteppingFrames();
    addWalkingFrames();
    addShadowRunningFrames();
    addMainLightIdle();
    addBrightGemLeftCorrect();
    addBrightGemRightCorrect();
    addBrightGemLeftDrop();
    addBrightGemRightDrop();
    addFade();
    //addSideLight();
    addBiomes();
    addMinimap();

    let state, explosion, exit, player,
    door, healthBar, message,scoreMessage, codeMessage, gameOverScene, enemies;    //Define any variables used in more than one function
    let  hero, heroDim, animatedHeroStepping, animatedHeroWalking, animatedDimHeroRunning, animatedBrightGemLeftCorrect, animatedBrightGemRightCorrect;
    let animatedBrightGemLeftDrop, animatedBrightGemRightDrop;
    let thankyouimg;
    var brightGemLeftCorrectArray = [];
    var brightGemRightCorrectArray = [];
    var brightGemLeftDropArray = [];
    var brightGemRightDropArray = [];
    var gem,gemDrop;
    let left = keyboard(65);
    let right = keyboard(68);
    let spacebar = keyboard(32);

    let textureButton, textureButtonDown, textureButtonOver, button;

    let displacementSprite, displacementFilter;
    //let quitButton;
    let yourScoreMessage, globalScoreMessage ,points_icon;
    let targetScore; //on screen

    var totalScore = 0;
    var LeftFlash = 0;
    var RightFlash = 0;
    //let doors = [];
    var chosenSide = 0;
    var went_right = 0;

    var rule = 0; //rule = 0: go for More Flashes, rule = 1: go for Less Flashes


    var firstPick = 1;
    //probality of which side being the right choice
    var leftProb;
    var rightProb;
    var lbin;
    var rbin;

    var isLeftSideSelected;
    var isRightSideSelected;

    //var trainBinStartTimer = 0;
    var testBinStartTimer = 0;
    var leftBin = [];
    var rightBin = [];

    var endofBinTime = 0;
    //phase
    //train
    var trialCounter;


    //data to send through json
    var user;
    var userinput;
    var highscore;
    ////////////////////////////
        //data to send through json
    //var cohort; //what training are u gonna get
   // var reward = '"rw":[';
    //var score = '"score":[';
    //var choice = '"choice":[';
    //var numflashleft = '"lflash":[';
    //var numflashright = '"rflash":['; 
    //var reactiontime = '"rt":[';
    //var choicetime = '"ct":[';
    //var leftBinRecord = '"lbin":[';
    //var rightBinRecord = '"rbin":[';
    //var iti = '"iti":[';
    //sound
    var goodsound;
    var badsound;


    var HitMiss = 0;


    var RT = 0; //reaction 
    var DT = 0; //decision
    var ST = 0; //start

    var caveBackgrounds = [];
    var caveForegrounds = [];

    var currentLevel = 0;
    var randomZoneLevelBg = 0;
    var randomZoneLevelFg = 0;


    //data structure
    var jsondata = new Object(); //JSON.parse(text);
    var trialArray = [];
    var trial = new Object();
    //var actionArray = [];
    //var action = new Object();


    Swal.fire({
        title: "Hello!",
        text: "Please enter the ID here:",
        input: 'text',
        showCancelButton: true        
    }).then((result) => {
        if (result.value) {
            console.log("Result: " + result.value);
            userinput = result.value;
        }
    });

    var screenTouched = 0;
    //The `setup` function will run when the loader has finished loading the image
    function setup() {
      //user = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
      jsondata.username = Math.random().toString(36).substring(2,10);
      
      jsondata.start_time = Date();
      
      var data = JSON.stringify(jsondata);
    //for testing locally..
    //var url = 'http://127.0.0.1:3000/SubjectData';
      var url = '/geode';
      var xhr = createCORSRequest('POST',url)
      if (!xhr){
        throw new Error('CORS not supported');
      } 
      xhr.setRequestHeader('Content-Type','application/json');
      xhr.onload = function(){
        var text = xhr.responseText;    
      };
      xhr.onerror = function(){
        alert("Error sending data to server");  
      };
      xhr.send(data);
      trialArray = [];


      goodsound = new sound('good_short.wav');
      badsound = new sound('wrong_boomp.wav');
      //themesong = new sound('bg.wav');
      trialCounter = 0;
     // app.stage.addChild(flashStage);
      //Create the cat sprite and add it to the stage

      for (var i = 0; i < BIOMES_BACKGROUND.length; i++){
        caveBackground = new PIXI.Sprite(BIOMES_BACKGROUND[i]);
        caveBackgrounds.push(caveBackground);
        caveForeground = new PIXI.Sprite(BIOMES_FOREGROUND[i]);
        caveForegrounds.push(caveForeground);
        caveBackgrounds[i].anchor.set(0.5);
        caveForegrounds[i].anchor.set(0.5);
      }
      

      //caveBackground = new PIXI.Sprite(PIXI.loader.resources["images/background_back_1.png"].texture);
      //caveForeground = new PIXI.Sprite(PIXI.loader.resources["images/background_front_1.png"].texture);
      //xmark = new PIXI.Sprite(PIXI.loader.resources["images/xmark_1.png"].texture);
      points_icon = new PIXI.Sprite(PIXI.loader.resources["images/points_icon.png"].texture);

      	flashStage.visible = 0;
        miniMapScene.visible = 0;
      ///////////////////////////////////////
        //gameScene = new Container();
        
        app.stage.addChild(gameScene);
        app.stage.addChild(flashStage);
        app.stage.addChild(miniMapScene);
        //id = resources["images/galaguh.json"].textures;
        //caveBackground = new Sprite(id["spaceBackground.psd"]);

        for (var i = 0; i < caveBackgrounds.length; i++){
          gameScene.addChild(caveBackgrounds[i]);


          caveBackgrounds[i].x=gameScene.width/2;
          caveBackgrounds[i].y=gameScene.height/2;
          caveForegrounds[i].x=gameScene.width/2;
          caveForegrounds[i].y=gameScene.height/2;
          if (i > 0){
            caveBackgrounds[i].visible = 0;
            caveForegrounds[i].visible = 0;
            caveBackgrounds[i].x=caveBackgrounds[i-1].x;
            caveBackgrounds[i].y=caveBackgrounds[i-1].y;
            caveForegrounds[i].x=caveForegrounds[i-1].x;
            caveForegrounds[i].y=caveForegrounds[i-1].y;
          }
        }
        
        //gameScene.addChild(xmark);
        //xmark.anchor.set(0.5);
        //xmark.x=caveBackground.x;
        //xmark.y= 4*gameScene.height/5;



        hero = new PIXI.Sprite(PIXI.loader.resources["images/character_bag_static.png"].texture);;
        hero.anchor.set(0.5);
        hero.width = hero.width/3;
        hero.height = hero.height/3;
        hero.x = caveBackgrounds[0].x - hero.width;
        hero.y = caveBackgrounds[0].y + hero.width/4;

        hero.vx = 0;
        hero.vy = 0;
        hero.visible=0;
        heroDim = new PIXI.Sprite(PIXI.loader.resources["images/character_silhouette.png"].texture);;
        heroDim.anchor.set(0.5);
        heroDim.x = caveBackgrounds[0].x;
        heroDim.y = hero.y - hero.width/8;
        heroDim.width = hero.width;
        heroDim.height = hero.height;

        
        let heroSteppingArray = [];

        for (let i=0; i < STEPPING_FRAMES.length; i++)
        {
             let texture = PIXI.Texture.from(STEPPING_FRAMES[i]);
             heroSteppingArray.push(texture);
        };
        animatedHeroStepping = new PIXI.extras.AnimatedSprite(heroSteppingArray);
        animatedHeroStepping.anchor.set(0.5);
        animatedHeroStepping.visible = 0;
        gameScene.addChild(animatedHeroStepping);

        
        let mainLightIdleArray = [];

        for (let i=0; i < MAIN_LIGHT_IDLE_FRAMES.length; i++)
        {
             let texture = PIXI.Texture.from(MAIN_LIGHT_IDLE_FRAMES[i]);
             mainLightIdleArray.push(texture);
        };


        gameScene.addChild(hero);
        gameScene.addChild(heroDim);
        heroDim.visible = 1;

        animatedDimHeroRunning = new PIXI.extras.AnimatedSprite(SHADOW_RUNNING_FRAMES.map(PIXI.Texture.fromImage));
        
        gameScene.addChild(animatedDimHeroRunning);
        animatedDimHeroRunning.visible = 0;

        animatedDimHeroRunning.x = 0;
        animatedDimHeroRunning.y = heroDim.y - heroDim.height + heroDim.height/12;
        animatedDimHeroRunning.animationSpeed = 0.5;
        animatedHeroWalking = new PIXI.extras.AnimatedSprite(WALKING_FRAMES.map(PIXI.Texture.fromImage));
        
        //animatedHeroWalking.width = hero.width/1.5;
        //animatedHeroWalking.height = hero.height;
        gameScene.addChild(animatedHeroWalking);
        animatedHeroWalking.visible = 0;

        animatedFade = new PIXI.extras.AnimatedSprite(FADE_FRAMES.map(PIXI.Texture.fromImage));
        animatedFade.anchor.set(0.5);
        animatedFade.x = caveBackgrounds[0].x;
        animatedFade.y = caveBackgrounds[0].y;
        animatedFade.width = caveBackgrounds[0].width;
        animatedFade.height = caveBackgrounds[0].height;
        animatedFade.loop = false;
        animatedFade.animationSpeed = 0.7;
        animatedFade.visible = 0;
        gameScene.addChild(animatedFade);
        FlashlightEffect = new PIXI.Sprite(PIXI.loader.resources["images/flashlightbeam_1.png"].texture);;
        FlashlightEffect.anchor.set(0.5);
        FlashlightEffect.x = hero.x - hero.width/2;
        FlashlightEffect.y = hero.y - hero.height/6;
        FlashlightEffect.visible=0;

        flashStage.addChild(FlashlightEffect);
        FlashlightEffect.alpha=0.15;
        //CENTER CHOICE
        CenterLightBeam = new PIXI.extras.AnimatedSprite(mainLightIdleArray);


        //CenterLightBeam = new PIXI.Sprite(PIXI.loader.resources["images/light_background_1.png"].texture);
        CenterLightBeam.anchor.set(0.5);
        CenterLightBeam.x = caveBackgrounds[0].x;
        CenterLightBeam.y = caveBackgrounds[0].y-20;
        CenterLightBeam.loop=true;
        CenterLightBeam.play();
        //CenterLightBeam.height = 2*CenterLightBeam.height/3;
        gameScene.addChild(CenterLightBeam);

        for (var  i = 0; i < caveForegrounds.length; i ++){
          gameScene.addChild(caveForegrounds[i]);
        }
        
        gameScene.addChild(points_icon);
        points_icon.anchor.set(0.5);
        points_icon.x = 60 ;
        points_icon.width = points_icon.width/1.5;
        points_icon.height = points_icon.height/1.5;

        points_icon.y = caveForegrounds[0].y +caveForegrounds[0].width/5;
        points_icon.visible=1;

      let style = new TextStyle({
          fontFamily: "\"Comic Sans MS\", cursive, sans-serif",
          fontSize: 80,
          fill: "#30c4e5",
      });


        scoreMessage = new Text("0", style);
        scoreMessage.anchor.set(0.5);
        scoreMessage.x = 200;
        scoreMessage.y = points_icon.y + points_icon.height/4;
        scoreMessage.text = "0";
        scoreMessage.visible=1;
        gameScene.addChild(scoreMessage);



        //caveForeground2 = new PIXI.Sprite(PIXI.loader.resources["images/background_front_1.png"].texture);
        //caveForeground2.anchor.set(0.5);
        //caveForeground2.x=gameScene.width/2;
        //caveForeground2.y=gameScene.height/2;
        //flashStage.addChild(caveForeground2);
  		CenterLightBeam.interactive = true;

  		CenterLightBeam.on('mouseover', function(event){
  		    //CenterLightBeam.tint = 0x00ffff;
  		});
  		CenterLightBeam.on('mouseout', function(event){
  		    //CenterLightBeam.tint = 0xffffff;
  		});

  		CenterLightBeam.on('mousedown',function (e){
        screenTouched = screenTouched + 1;
        if(screenTouched == 1){
          testBinStartTimer = performance.now();
          //console.log(screenTouched);
          //iti = iti + '{"iter":' + (testBinStartTimer - DT) + '},';
          trial.iti = testBinStartTimer - DT;

          //console.log(testBinStartTimer - DT);
        }
        CenterLightBeam.interactive=false;
        heroDim.visible = 0;
        hero.x = CenterLightBeam.x;
        hero.visible = 0;

        heroDim.x = hero.x;
        heroDim.y = hero.y;
       
        //animatedHeroStepping.x = caveBackground.x;
        //animatedHeroStepping.y = caveBackground.y;
        animatedHeroStepping.visible = 1;
        //gameScene.addChild(animatedHeroStepping);
        //animatedHeroStepping.anchor.set(0.5);
        animatedHeroStepping.animationSpeed=0.2;
        animatedHeroStepping.loop = false;
        animatedHeroStepping.width= hero.width*1.2;
        animatedHeroStepping.height = hero.height*1.2;
        animatedHeroStepping.x = CenterLightBeam.x;
        animatedHeroStepping.y = hero.y;
        animatedHeroStepping.play();
        animatedHeroStepping.onComplete = function(){
            animatedHeroStepping.gotoAndStop(0);
            animatedHeroStepping.visible=0;
            screenTouched = 0;
            hero.visible = 1;
            heroDim.visible=0;
            FlashlightEffect.x = hero.x - hero.width/7;
            FlashlightEffect.y = hero.y - hero.height/14;

            if (trialCounter < 5){
              if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                leftProb = 0;
                rightProb = 1;
              }
              else{
                  leftProb = 1;
                  rightProb = 0;
              }

            }
            else if (trialCounter < 10){
              if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                leftProb = 0.1;
                rightProb = 0.9;
              }
              else{
                leftProb = 0.9;
                rightProb = 0.1;
              }
            }
            else{
                if (coinFlip(0.5)){
                    if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                        if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                            leftProb = 0.3;
                            rightProb = 0.7;
                        }
                        else{
                            leftProb = 0.7;
                            rightProb = 0.3;
                        }
                    }
                    else{
                        if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                            leftProb = 0.4;
                            rightProb = 0.6;
                        }
                        else{
                            leftProb = 0.6;
                            rightProb = 0.4;
                        }
                    }
                }
                else {
                    leftProb = Math.random();
                    rightProb = Math.random();
                }   
            }
            //testBinStartTimer = performance.now();
            state = fade;
            //state = trial_init;
        }	
  		});

  		
      //TOUCH SCREEN VERSION
        CenterLightBeam.on('touchstart',function (e){
        screenTouched = screenTouched + 1;
        if(screenTouched == 1){
            testBinStartTimer = performance.now();
          //console.log(screenTouched);
            //iti = iti + '{"iter":' + (testBinStartTimer - DT) + '},';
            trial.iti = testBinStartTimer - DT;

          //console.log(testBinStartTimer - DT)
        }
        CenterLightBeam.interactive=false;
        heroDim.visible = 0;
        hero.x = CenterLightBeam.x;
        hero.visible = 0;

        heroDim.x = hero.x;
        heroDim.y = hero.y;
       
        //animatedHeroStepping.x = caveBackground.x;
        //animatedHeroStepping.y = caveBackground.y;
        animatedHeroStepping.visible = 1;
        //gameScene.addChild(animatedHeroStepping);
        //animatedHeroStepping.anchor.set(0.5);
        animatedHeroStepping.animationSpeed=0.2;
        animatedHeroStepping.loop = false;
        animatedHeroStepping.width= hero.width*1.2;
        animatedHeroStepping.height = hero.height*1.2;
        animatedHeroStepping.x = CenterLightBeam.x;
        animatedHeroStepping.y = hero.y;
        animatedHeroStepping.play();
        animatedHeroStepping.onComplete = function(){
            animatedHeroStepping.gotoAndStop(0);
            animatedHeroStepping.visible=0;
            screenTouched = 0;
            hero.visible = 1;
            heroDim.visible=0;
            FlashlightEffect.x = hero.x - hero.width/7;
            FlashlightEffect.y = hero.y - hero.height/14;

            if (trialCounter < 5){
              if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                leftProb = 0;
                rightProb = 1;
              }
              else{
                  leftProb = 1;
                  rightProb = 0;
              }

            }
            else if (trialCounter < 10){
              if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                leftProb = 0.1;
                rightProb = 0.9;
              }
              else{
                leftProb = 0.9;
                rightProb = 0.1;
              }
            }
            else{
                if (coinFlip(0.5)){
                    if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                        if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                            leftProb = 0.3;
                            rightProb = 0.7;
                        }
                        else{
                            leftProb = 0.7;
                            rightProb = 0.3;
                        }
                    }
                    else{
                        if (coinFlip(0.5)){ //toss coin to see which side will win, L or R
                            leftProb = 0.4;
                            rightProb = 0.6;
                        }
                        else{
                            leftProb = 0.6;
                            rightProb = 0.4;
                        }
                    }
                }
                else {
                    leftProb = Math.random();
                    rightProb = Math.random();
                }   
            }
            //testBinStartTimer = performance.now();
            state = fade;
            //state = trial_init;
        }   
      });

        //LEFT AND RIGHT CHOICE
      DullLeftGem = new PIXI.Sprite(PIXI.loader.resources["images/DullLeftGem.png"].texture);
      DullLeftGem.anchor.set(0);
      DullLeftGem.x = gameScene.width/4 - DullLeftGem.width/3;
      DullLeftGem.y = 2*gameScene.height/3 -DullLeftGem.height/1.8;
    	DullRightGem = new PIXI.Sprite(PIXI.loader.resources["images/DullRightGem.png"].texture);
     	DullRightGem.anchor.set(0);
      DullRightGem.x = 3*gameScene.width/4 - DullRightGem.width/3;
      DullRightGem.y = 2*gameScene.height/3 -DullRightGem.height/1.8 ;

      gameScene.addChild(DullRightGem);
      gameScene.addChild(DullLeftGem);

      LeftGem = new PIXI.Sprite(PIXI.loader.resources["images/brightgem_left_static.png"].texture);
      LeftGem.anchor.set(0);
      LeftGem.x = DullLeftGem.x;
      LeftGem.y = DullLeftGem.y;
    	RightGem = new PIXI.Sprite(PIXI.loader.resources["images/brightgem_right_static.png"].texture);
     	RightGem.anchor.set(0);
      RightGem.x = DullRightGem.x;
      RightGem.y = DullRightGem.y;


      for (let i=0; i < BRIGHT_GEM_LEFT_CORRECT_FRAMES.length; i++)
        {
            let texture = PIXI.Texture.from(BRIGHT_GEM_LEFT_CORRECT_FRAMES[i]);
            brightGemLeftCorrectArray.push(texture);
        };


      for (let i=0; i < BRIGHT_GEM_RIGHT_CORRECT_FRAMES.length; i++)
        {
            let texture = PIXI.Texture.from(BRIGHT_GEM_RIGHT_CORRECT_FRAMES[i]);
            brightGemRightCorrectArray.push(texture);
        };


      for (let i=0; i < BRIGHT_GEM_LEFT_DROP_FRAMES.length; i++)
        {
            let texture = PIXI.Texture.from(BRIGHT_GEM_LEFT_DROP_FRAMES[i]);
            brightGemLeftDropArray.push(texture);
        };


      for (let i=0; i < BRIGHT_GEM_RIGHT_DROP_FRAMES.length; i++)
        {
            let texture = PIXI.Texture.from(BRIGHT_GEM_RIGHT_DROP_FRAMES[i]);
            brightGemRightDropArray.push(texture);
        };


      animatedBrightGemLeftCorrect = new PIXI.extras.AnimatedSprite(brightGemLeftCorrectArray);
      animatedBrightGemRightCorrect = new PIXI.extras.AnimatedSprite(brightGemRightCorrectArray);
      gameScene.addChild(animatedBrightGemRightCorrect);
      gameScene.addChild(animatedBrightGemLeftCorrect);
      animatedBrightGemLeftCorrect.visible=0;
      animatedBrightGemRightCorrect.visible=0;
      animatedBrightGemLeftCorrect.anchor.set(0.5);
      animatedBrightGemRightCorrect.anchor.set(0.5);
      animatedBrightGemLeftCorrect.x = DullLeftGem.x + animatedBrightGemLeftCorrect.width/4;
      animatedBrightGemLeftCorrect.y = DullLeftGem.y ;

      animatedBrightGemRightCorrect.x = DullRightGem.x + animatedBrightGemRightCorrect.width/4;
      animatedBrightGemRightCorrect.y = DullRightGem.y ;


      animatedBrightGemLeftDrop = new PIXI.extras.AnimatedSprite(brightGemLeftDropArray);
      animatedBrightGemRightDrop = new PIXI.extras.AnimatedSprite(brightGemRightDropArray);
      gameScene.addChild(animatedBrightGemRightDrop);
      gameScene.addChild(animatedBrightGemLeftDrop);

      animatedBrightGemLeftDrop.anchor.set(0.5);
      animatedBrightGemRightDrop.anchor.set(0.5);
      animatedBrightGemLeftDrop.visible = 0;
      animatedBrightGemRightDrop.visible = 0;

      animatedBrightGemLeftDrop.x = hero.x - hero.width/4;
      animatedBrightGemLeftDrop.y = hero.y - hero.height/4;
      animatedBrightGemRightDrop.x = hero.x - hero.width/4;
      animatedBrightGemRightDrop.y =  hero.y - hero.height/4;

      LeftLightBeam = new PIXI.Sprite(PIXI.loader.resources["images/sidelight_static.png"].texture);
      LeftLightBeam.anchor.set(0.5);
      LeftLightBeam.x = DullLeftGem.x + DullLeftGem.width/2;
      LeftLightBeam.y = caveBackgrounds[0].y;

      RightLightBeam = new PIXI.Sprite(PIXI.loader.resources["images/sidelight_static.png"].texture);
      RightLightBeam.anchor.set(0.5);
      RightLightBeam.x = DullRightGem.x + DullRightGem.width/2;
      RightLightBeam.y = caveBackgrounds[0].y;
      flashStage.addChild(LeftLightBeam);
      flashStage.addChild(RightLightBeam);
      flashStage.addChild(LeftGem);
      flashStage.addChild(RightGem);

      gameOverScene = new Container();
      app.stage.addChild(gameOverScene);

      gameOverScene.visible = false;  
      style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 40,
        fill: "white"
      });
      
      
      //message = new Text("Thank you for playing!", style);
      //message.anchor.set(0.5);
      //message.x = gameScene.width/2;
      //message.y = gameScene.height/2;
      thankyouimg = new PIXI.Sprite(PIXI.loader.resources["images/Thankyou.png"].texture);
      gameOverScene.addChild(thankyouimg);
      
    	//Create the `gameOver` scene
      //state = play;
      //app.ticker.add(delta => gameLoop(delta));
      state = play;
      smoothie.start();

    }

    //All your game or application logic goes in this `update` function
    //that you've supplied to Smoothie when you instantiated it above. Smoothie will run this
    //`update` function in loop at
    //whatever fps (frames-per-second) you've defined.

    function gameLoop(delta){
     //Update the current game state:
     state(delta);
    }

    function testConnection(){
      var params = 'lim=1';
     // var url =  'http://127.0.0.1:3000/eviaco';
      var url = '/geode';

      var xhr = createCORSRequest('GET', url + "?" + params);
      if (!xhr) {
           throw new Error('CORS not supported');
      }
      // xhr.open("POST", myUrl, true);
       //xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
      xhr.onload = function(){ 
        if (xhr.readyState === xhr.DONE) {
          if (xhr.status === 200) {
            console.log("connected");
            //console.log(xhr.responseText);
            //var text = xhr.responseText;
            //var obj = JSON.parse(text);
            //cohort = (obj.msg.length)%2;


           // state = play;
          }
        }
      }
 
      xhr.send(null);
      state = play;
    }

    //play loop
    function play(delta){
      //RESET ALL CHOICE
      	//CenterLightBeam.interactive = true;
	    //CenterLightBeam.tint = 0xffffff;
	    //CenterLightBeam.visible = 1;
       // themesong.play();
       // themesong.volume=0.1;
        sendOnce = 0; //send data once
        LeftGem.x = DullLeftGem.x;
        LeftGem.y = DullLeftGem.y;
        RightGem.x = DullRightGem.x + 30;
        RightGem.y = DullRightGem.y + 30;
		    //hero.x = caveBackground.x - hero.width;
		    FlashlightEffect.visible=0;
      	isLeftSideSelected = 0;
      	isRightSideSelected = 0;
      	//Visible scene
        gameScene.visible= true;
        gameScene.alpha = 1;
        flashStage.visible = false;
        gameOverScene.visible = false;
        CenterLightBeam.interactive = true;
        LeftLightBeam.interactive=false;
        RightLightBeam.interactive=false;
        CenterLightBeam.visible=1;
        LeftLightBeam.visible=0;
        RightLightBeam.visible=0;
        DullLeftGem.visible=1;
        DullRightGem.visible=1;
        DullLeftGem.x = gameScene.width/4 - DullLeftGem.width/3;
        DullLeftGem.y = 2*gameScene.height/3 -DullLeftGem.height/1.8;
        DullRightGem.x = 3*gameScene.width/4 - DullRightGem.width/3;
        DullRightGem.y = 2*gameScene.height/3 -DullRightGem.height/1.8;
        

  	}
    function fade(delta){
      heroDim.visible=0;        
      scoreMessage.alpha =0;
      points_icon.alpha = 0.1;
      CenterLightBeam.visible=0;
      animatedFade.visible = 1;
      animatedFade.play();
      animatedFade.onComplete = function(){
        hero.visible = 0;
        heroDim.visible = 1;
        FlashlightEffect.visible=1;

        CenterLightBeam.interactive = false;
        CenterLightBeam.visible=0;
        LeftLightBeam.interactive = false;
        LeftLightBeam.visible=0;
        RightLightBeam.interactive = false;
        RightLightBeam.visible=0;
        animatedFade.visible = 0;
        animatedFade.gotoAndStop(0);
        heroDim.visible=1;
        gameScene.visible = true;
        caveForegrounds[currentLevel + randomZoneLevelFg].alpha = 0.7;
        DullRightGem.alpha = 0.2;
        DullLeftGem.alpha = 0.2;
    //xmark.alpha=0.1;
        caveBackgrounds[currentLevel + randomZoneLevelBg].alpha = 0.05;
        flashStage.visible = true;
        gameOverScene.visible = false;
        state = test_flash;
      }
    }

  	//function trial_init(delta) {
      
	    //Turn on flash light here;
	  //  state = test_flash;
  	//}

  	var frameCount = 0;
    var binDuration = 260; //duration of each bin
    var binCount = 0;
    var inBin = 1;

    var lflash = 0;
    var rflash = 0;
    var currentLevel = 0;

  	function test_flash(delta) {
    //heroDim.visible=1;
    //gameScene.visible = true;
    //caveForegrounds[currentLevel + randomZoneLevelFg].alpha = 0.7;
    //DullRightGem.alpha = 0.2;
    //DullLeftGem.alpha = 0.2;
    //xmark.alpha=0.1;
    //caveBackgrounds[currentLevel + randomZoneLevelBg].alpha = 0.05;
    //flashStage.visible = true;
    //gameOverScene.visible = false;

    if (binCount % 1 == 0){ //every x bins we have 1 flash

      if (inBin){ //what to do in this bin
        //have not flashed left yet
        if (lflash == 0){
          if(coinFlip(leftProb)){
            LeftGem.visible = 1;
            lflash = 1;
            LeftFlash = LeftFlash + 1;
            leftBin.push(performance.now()-testBinStartTimer);
            }
          else {
            LeftGem.visible = 0;
            lflash = 1; // don't flash anymore? or wait for 20ms? and then flash?
            }
          }
        else{
            LeftGem.visible = 0;
            }
        //have not flashed right yet       
        if (rflash == 0){
          if(coinFlip(rightProb)){
            RightGem.visible = 1;
            rflash = 1;
            RightFlash = RightFlash + 1;
            rightBin.push(performance.now()-testBinStartTimer);
            }
          else {
            RightGem.visible = 0;
            rflash = 1; // don't flash anymore? or wait for 20ms? then stop
            }
          }
        else{ //if flashed right already
            RightGem.visible = 0;
          }
      } //end of bin
      else {
        LeftGem.visible = 0;
        RightGem.visible = 0;
      }
    } //outside bin, next x bin 
     
    if (frameCount > 13){ // 13 frames total, so a bin is 20*13 = 260ms
      inBin = 0; //next bin
      binCount = binCount + 1;
      frameCount = 0;
      lflash = 0;
      rflash = 0;
   //    console.log(binCount);
    }
    else {
      inBin = 1; //in the same bin
      frameCount = frameCount + 1;
    }
    
  //if ((binCount > 9) || (isRadarSelected2) || (isRadarSelected1)){ //10 bin 13*260ms = 3s ish
  // if ( (isRadarSelected2) || (isRadarSelected1)){ //10 bin 13*260ms = 3s ish
   	if (binCount > 9){
      binCount = 0;
      frameCount = 0;
      lflash = 0;
      rflash = 0;
      //console.log(LeftFlash);
      //console.log(RightFlash);

      //IF we see 4-6 and 3-7 --> random Reward or random Door
        if (LeftFlash > RightFlash) { //reward location
	        if (rule == 0){
	        	chosenSide = 0;
	        }
	        else {
	        	chosenSide = 0; //1 to do rule switch
	          	}
	        }
        else if (LeftFlash < RightFlash){
        	if (rule == 0){
            	chosenSide = 1;
          	}
        	else {
            	chosenSide = 1; //0 to do rule switch
          	}
        }
        else { //equal 
        	chosenSide = 2;
        }
      //LeftFlash = 0;
      //RightFlash = 0;
      //leftBinRecord = leftBinRecord + '{"array":' + JSON.stringify(leftBin) + '},';
      //rightBinRecord = rightBinRecord + '{"array":' + JSON.stringify(rightBin) + '},'; 
      trial.leftBinRecord = leftBin;
      trial.rightBinRecord = rightBin;
      state = decision;
      //state = play;
      LeftGem.visible = 0;
      RightGem.visible = 0;
 
      leftBin = [];
      rightBin = [];

    }
    //You can change Smoothie's `fps` at any time, like this:
    //smoothie.fps = 1; //basically changing duration of flash
    //You can turn interpolation (animation smoothing) on or off at any
    //time using Smoothie's `interpolate` Boolean property, like this:
  	}
 	
	function decision(delta){
	    flashStage.visible = true;
        heroDim.visible = 0;
        hero.visible = 1;
      //gameScene.alpha=0.8;
        caveForegrounds[currentLevel + randomZoneLevelFg].alpha = 1;
        caveBackgrounds[currentLevel + randomZoneLevelBg].alpha = 1;
        DullRightGem.alpha = 1;
        DullLeftGem.alpha = 1;
        scoreMessage.alpha =1;
        points_icon.alpha = 1;
      //xmark.alpha=1;

        gameScene.alpha=0.8;

	    LeftGem.visible=0;
	    RightGem.visible=0;
	    LeftLightBeam.visible=1;
	    RightLightBeam.visible=1;
	    FlashlightEffect.visible=0;
	    LeftLightBeam.interactive=true;
	    RightLightBeam.interactive=true;
        LeftLightBeam.alpha=0.6
        RightLightBeam.alpha= 0.6
	    LeftLightBeam.on('mouseover', function(event){
		    //LeftLightBeam.tint = 0x00ffff;
		});
		LeftLightBeam.on('mouseout', function(event){
		    //LeftLightBeam.tint = 0xffffff;
		});

		RightLightBeam.on('mouseover', function(event){
		    //RightLightBeam.tint = 0x00ffff;
		});
		RightLightBeam.on('mouseout', function(event){
		    //RightLightBeam.tint = 0xffffff;
		});

		LeftLightBeam.on('mousedown',function (e){
          screenTouched = screenTouched + 1;
          isLeftSideSelected=1;
          hero.visible=1;
          if (screenTouched == 1){
              RT = performance.now() - testBinStartTimer;
              console.log(RT);
              DT = performance.now();
          }
		  });

		RightLightBeam.on('mousedown',function (e){
          screenTouched = screenTouched + 1;
          hero.visible=1;
          isRightSideSelected=1;
          if (screenTouched == 1){
              RT = performance.now() - testBinStartTimer;
              console.log(RT);
              DT = performance.now();

          }

		});
        LeftLightBeam.on('touchstart',function (e){
          screenTouched = screenTouched + 1;
          isLeftSideSelected=1;
          hero.visible=1;
          if (screenTouched == 1){
              RT = performance.now() - testBinStartTimer;
              console.log(RT);
              DT = performance.now();

          }

        });

        RightLightBeam.on('touchstart',function (e){
          screenTouched = screenTouched + 1;
          hero.visible=1;
          isRightSideSelected=1;
          if (screenTouched == 1){
              RT = performance.now() - testBinStartTimer;
              console.log(RT);
              DT = performance.now();
          }
        });
		
		//Check Decision
	    if (isLeftSideSelected){
        screenTouched = 0;

	      went_right = 0; //did not go right
	      if (chosenSide == 0){
	          state = rightchoice;
	      }
	      else {
	          state = wrongchoice;
	      }
	    }
	    if (isRightSideSelected){
        screenTouched = 0;
	      went_right = 1;
	      if (chosenSide == 1){
	          state = rightchoice;
	      }
	      else {
	          state = wrongchoice;
	      }
	    }
	}
	 

	function wrongchoice(delta) {
        screenTouched = screenTouched + 1;
        if (screenTouched == 1){
            trial.reward = 0;
            trial.score = 0;
            trial.numflashleft = LeftFlash;
            trial.numflashright = RightFlash;
            trial.reactiontime = RT;
            trial.choice = went_right
            trialCounter = trialCounter + 1;

            //score = score + '{"iter":0},';
            //numflashleft = numflashleft + '{"iter":' + LeftFlash + '},';
            //numflashright = numflashright + '{"iter":' + RightFlash + '},';
            //reactiontime = reactiontime + '{"iter":' + RT + '},';
            //choice = choice + '{"iter":' + went_right + '},';
            //reward = reward + '{"iter":0},';
        }
        

	    //score = score + '{"iter":0},';

	    //numflashleft = numflashleft + '{"iter":' + LeftFlash + '},';
	    //numflashright = numflashright + '{"iter":' + RightFlash + '},';
	    //reactiontime = reactiontime + '{"iter":' + RT + '},';
	    //choicetime = choicetime + '{"iter":' + DT + '},';
	    
	    //choice = choice + '{"iter":' + went_right + '},';

	    //////////////unCOMMENT to CHANGE CONDITION
	    //////////////////////////////////REAL REWARD instead of Probabilistic reward//////////////////////
	    //if ((LeftFlash == 10 & RightFlash == 0) || (LeftFlash == 0 & RightFlash == 10) || (LeftFlash == 9 & RightFlash == 1) || (LeftFlash == 1 & RightFlash == 9)){
	    totalScore = totalScore;
        LeftLightBeam.visible=0;
        RightLightBeam.visible=0;
	    //reward = reward + '{"iter":0},';
	    //reset
	    LeftFlash = 0;
	    RightFlash = 0;
	    HitMiss = 0;
        badsound.play();
	    //scoreMessage.text = totalScore.toString();
	    state = crumble;
	}
	function crumble(delta){
      screenTouched = 0;
	    DullRightGem.y += 3;
	    DullLeftGem.y += 3;
        if (DullLeftGem.y > 900){
            if ((trialCounter == 11) || (trialCounter == 32)){
                once = 1;
                state = Minimap;
                currentLevel = currentLevel + 3;
              }
            else{
              state = sendData;
            }
            animatedHeroWalking.anchor.set(0.5);

            animatedHeroWalking.x = hero.x;
            animatedHeroWalking.y = hero.y - hero.height/8;          
            animatedHeroWalking.visible = 0;
            animatedHeroWalking.animationSpeed=0.7;
            animatedHeroWalking.loop = 0;
            //state = sendData;

        }
	}
	function rightchoice(delta) {
        screenTouched = screenTouched + 1;
	  //////////////unCOMMENT to CHANGE CONDITION
	    //if ((LeftFlash == 10 & RightFlash == 0) || (LeftFlash == 0 & RightFlash == 10) || (LeftFlash == 9 & RightFlash == 1) || (LeftFlash == 1 & RightFlash == 9)){
	    if (screenTouched == 1){
            trial.reward = 1;
            trial.score = 1;
            trial.numflashleft = LeftFlash;
            trial.numflashright = RightFlash;
            trial.reactiontime = RT;
            trial.choice = went_right
            trialCounter = trialCounter + 1;
           //reward = reward + '{"iter":1},';
           //score = score + '{"iter":1},';
           //numflashleft = numflashleft + '{"iter":' + LeftFlash + '},';
           //numflashright = numflashright + '{"iter":' + RightFlash + '},';
           //reactiontime = reactiontime + '{"iter":' + RT + '},';
           //choicetime = choicetime + '{"iter":' + DT + '},';
           //choice = choice + '{"iter":' + went_right + '},';
           //totalScore = totalScore + 1;
        }
       
	    //reward = reward + '{"iter":1},';
	    LeftFlash = 0;
	    RightFlash = 0;
	    HitMiss=1;
	   // scoreMessage.text = totalScore.toString();

	    //score = score + '{"iter":1},';
	    //numflashleft = numflashleft + '{"iter":' + LeftFlash + '},';
	    //numflashright = numflashright + '{"iter":' + RightFlash + '},';
	    //reactiontime = reactiontime + '{"iter":' + RT + '},';
	    //choicetime = choicetime + '{"iter":' + DT + '},';

	    //choice = choice + '{"iter":' + went_right + '},';

	    if (isLeftSideSelected){
	    	LeftGem.visible = 1;

	    }
	    if (isRightSideSelected){
	    	RightGem.visible=1;
	    }
	    goodsound.play();
      LeftGem.visible = 0;
      RightGem.visible = 0;
      LeftLightBeam.visible=0;
      RightLightBeam.visible=0;
      DullLeftGem.visible = 0;
      DullRightGem.visible = 0;

      if (isLeftSideSelected){
        gem = animatedBrightGemLeftCorrect;
      }
      if (isRightSideSelected){
        gem = animatedBrightGemRightCorrect;
      }
      gem.visible = 1;
      gem.loop = false;
      gem.animationSpeed = 0.7;
        //reset
      gem.onComplete = function(){

        gem.visible=0;
        gem.gotoAndStop(0);
        LeftGem.visible = 0;
        RightGem.visible = 0;
        LeftLightBeam.visible=0;
        RightLightBeam.visible=0;

        animatedBrightGemLeftDrop.x = hero.x - hero.width/4;
        animatedBrightGemLeftDrop.y = hero.y - hero.height/4;
        animatedBrightGemRightDrop.x = hero.x - hero.width/4;
        animatedBrightGemRightDrop.y =  hero.y - hero.height/4;

        if (isLeftSideSelected){
          gemDrop = animatedBrightGemLeftDrop;
        }
        if (isRightSideSelected){
          gemDrop = animatedBrightGemRightDrop;
        }

        gemDrop.visible=1;
        gemDrop.loop = false;
        gemDrop.animationSpeed = 0.7;

        state=GemDrop;
      } 
      gem.play();
      
	}

  	function GemDrop(){
        screenTouched = 0;
	    gemDrop.play();
        totalScore = totalScore +1;
        scoreMessage.text = totalScore.toString();
	    gemDrop.onComplete = function(){
	        //gemDrop.stop();
	        
	      //reward = reward + '{"iter":1},';

	        gemDrop.visible = 0;
	        gemDrop.gotoAndStop(0);
            animatedHeroWalking.anchor.set(0.5);

	        animatedHeroWalking.x = hero.x;
	        animatedHeroWalking.y = hero.y - hero.height/8;
	        animatedHeroWalking.visible = 1;
	        animatedHeroWalking.animationSpeed=0.7;
	        animatedHeroWalking.loop = 0;
	        state = Walk;
	     } 
  	}

  	function Walk(){
      hero.visible=0;
      animatedHeroWalking.visible=1
      animatedHeroWalking.play();
      //animatedHeroWalking.x += 5;
      animatedFade.visible = 1;
      animatedFade.play();
      animatedHeroWalking.onComplete = function(){
            animatedHeroWalking.visible = 0;
            DullRightGem.visible= 1;
            DullLeftGem.visible =1;
            animatedFade.onComplete = function(){
              //animatedDimHeroRunning.visible = 1;
              //animatedDimHeroRunning.loop = 0;
              //animatedDimHeroRunning.play();
              animatedFade.gotoAndStop(0);
              animatedFade.visible = 0;

              //animatedDimHeroRunning.onComplete = function(){
                //animatedFade.gotoAndStop(0);
              animatedHeroWalking.gotoAndStop(0);
              animatedHeroWalking.visible = 0;
              //heroDim.visible = 1;
              //heroDim.x = caveBackgrounds[currentLevel + randomZoneLevelBg].x;
              //heroDim.y = hero.y - hero.width/8;
              if (trialCounter == 11){
                once = 1;
                state = Minimap;
                currentLevel = currentLevel + 3;
              }              
              else if (trialCounter == 200){
                state = sendData;
              }
              else if ((trialCounter-11)% 21 == 0){
                once = 1;
                state = Minimap;
                currentLevel = currentLevel + 3;  
              }

              else {
                  once = 1;
                  state = NewTrial;
              }
              //}
            }
      }
    //  if (animatedHeroWalking.x > caveBackgrounds[0].x + caveBackgrounds[0].width/2){
    //        animatedHeroWalking.gotoAndStop(0);
            //gameScene.removeChild(animatedHeroWalking);
     //       animatedHeroWalking.visible = 0;
     //       animatedFade.visible = 1;
     //       animatedFade.play();
      //      animatedFade.onComplete = function(){
      //        trialCounter = trialCounter+1;
      //        animatedFade.gotoAndStop(0);
      //        animatedFade.visible = 0;
      //        heroDim.visible = 1;
      //        heroDim.x = caveBackgrounds[currentLevel].x;
      //        heroDim.y = hero.y - hero.width/8;
      //        if (trialCounter % 3 == 0){
      //          once = 1;
      //        	state = Minimap;
       //         currentLevel = currentLevel + 1;
       //       }
       //       else {
       //       	state = play;
//
        //      }
       //     }
      //	} 
  	}

    var once = 1;
  	function Minimap(){ //move character along minimap
      flashStage.visible=0;
      gameScene.visible = 0;
      //gameWindow.style.display = "none"
      if (once == 1){

        randomZoneLevelBg = Math.floor(Math.random()*3);
        randomZoneLevelFg = Math.floor(Math.random()*3);
        heroDim.visible = 1;
        heroDim.x = caveBackgrounds[currentLevel + randomZoneLevelBg].x;
        heroDim.y = hero.y - hero.width/8;
        for (var i = 0; i < caveBackgrounds.length;i++){
          if (i == (currentLevel + randomZoneLevelBg)){
            caveBackgrounds[i].visible = 1;
            caveBackgrounds[i].anchor.set(0.5);
          }
          else {
            caveBackgrounds[i].visible = 0;
          }
        }
        for (var i = 0; i < caveForegrounds.length;i++){
          if (i == (currentLevel + randomZoneLevelFg)){
            caveForegrounds[i].visible = 1;
            caveForegrounds[i].anchor.set(0.5);
          }
          else {
            caveForegrounds[i].visible = 0;
          }
        }
        var video = document.createElement('video');
        video.setAttribute("id", "VID1");
        video.src = '../images/minimap/' + ((currentLevel/3)).toString() + '.mp4';
        video.setAttribute('playsinline', true);
        video.setAttribute('autoplay', true);
        video.setAttribute('muted', true);

        video.width = 7*caveBackgrounds[0].width/8;
        video.height = 7*caveBackgrounds[0].height/8;;
        video.addEventListener('ended',myHandler,false);
        gameWindow.appendChild(video);
      }
      function myHandler(e) {
          var el = document.getElementById('VID1');
          gameWindow.removeChild(el);
          state = sendData;
;
      } 
      once = once + 1;
  	}

  function NewTrial(){ //add a random number to the current level to get a new foreground and background each trial
      if (once == 1){
          once = once + 1;
          randomZoneLevelBg = Math.floor(Math.random()*3);
          randomZoneLevelFg = Math.floor(Math.random()*3);
          flashStage.visible=0;
          gameScene.visible = 1;
            //gameWindow.style.display = "none"
          for (var i = 0; i < caveBackgrounds.length;i++){
                if (i == (currentLevel + randomZoneLevelBg)){
                  caveBackgrounds[i].visible = 1;
                  caveBackgrounds[i].anchor.set(0.5);
            // create a new Sprite using the video texture (yes it's that easy)
                }
                else {
                  caveBackgrounds[i].visible = 0;
                }
              }
          for (var i = 0; i < caveForegrounds.length;i++){
                if (i == (currentLevel + randomZoneLevelFg)){
                  caveForegrounds[i].visible = 1;
                  caveForegrounds[i].anchor.set(0.5);
            // create a new Sprite using the video texture (yes it's that easy)
                }
                else {
                  caveForegrounds[i].visible = 0;
                }
          }

          animatedDimHeroRunning.visible = 1;
          animatedDimHeroRunning.loop = 0;
          animatedDimHeroRunning.play();
          animatedDimHeroRunning.onComplete = function(){
              animatedDimHeroRunning.visible = 0;
              animatedDimHeroRunning.gotoAndStop(0);
              heroDim.visible = 1;
              heroDim.x = caveBackgrounds[currentLevel + randomZoneLevelBg].x;
              heroDim.y = hero.y - hero.width/8;
              //if (trialCounter >= 5){
              state = sendData;
              //}
              //else{
              //  state = play;
              //}
              //state = play;
            }
          }
      once = once + 1;
    }
    
	//sound
	function sound(src) {
	  this.sound = document.createElement("audio");
	  this.sound.src = src;
	  this.sound.setAttribute("preload", "auto");
	  this.sound.setAttribute("controls", "none");
	  this.sound.style.display = "none";
	  document.body.appendChild(this.sound);
	  this.play = function(){
	    this.sound.play();
	  }
	  this.stop = function(){
	    this.sound.pause();
	  }
	}

	function contain(sprite, container) {
	  let collision = undefined;
	  if (sprite.x < container.x) {
	    sprite.x = container.x;
	    collision = "left";
	  }
	  if (sprite.y < container.y) {
	    sprite.y = container.y;
	    collision = "top";
	  }
	  if (sprite.x + sprite.width > container.width) {
	    sprite.x = container.width - sprite.width;
	    collision = "right";
	  }
	  if (sprite.y + sprite.height > container.height) {
	    sprite.y = container.height - sprite.height;
	    collision = "bottom";
	  }
	  return collision;
	}
	function hitTestRectangle(r1, r2) {
	  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
	  hit = false;
	  r1.centerX = r1.x + r1.width / 2;
	  r1.centerY = r1.y + r1.height / 2;
	  r2.centerX = r2.x + r2.width / 2;
	  r2.centerY = r2.y + r2.height / 2;
	  r1.halfWidth = r1.width / 2;
	  r1.halfHeight = r1.height / 2;
	  r2.halfWidth = r2.width / 2;
	  r2.halfHeight = r2.height / 2;
	  vx = r1.centerX - r2.centerX;
	  vy = r1.centerY - r2.centerY;
	  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
	  if (Math.abs(vx) < combinedHalfWidths) {
	    if (Math.abs(vy) < combinedHalfHeights) {
	      hit = true;
	    } else {
	      hit = false;
	    }
	  } else {
	    hit = false;
	  }
	  return hit;
	};
	function randomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function keyboard(keyCode) {
	  var key = {};
	  key.code = keyCode;
	  key.isDown = false;
	  key.isUp = true;
	  key.press = undefined;
	  key.release = undefined;
	  key.downHandler = function(event) {
	    if (event.keyCode === key.code) {
	      if (key.isUp && key.press) key.press();
	      key.isDown = true;
	      key.isUp = false;
	    }
	    event.preventDefault();
	  };
	  key.upHandler = function(event) {
	    if (event.keyCode === key.code) {
	      if (key.isDown && key.release) key.release();
	      key.isDown = false;
	      key.isUp = true;
	    }
	    event.preventDefault();
	  };
	  window.addEventListener(
	    "keydown", key.downHandler.bind(key), false
	  );
	  window.addEventListener(
	    "keyup", key.upHandler.bind(key), false
	  );
	  return key;
	}

  	function addSteppingFrames() {
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;

      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 6; i > 1; i-- ) {
        url = '../images/stepping/tile' + pad( i ) + '.png';
        STEPPING_FRAMES.push( url );
      }
  	}

  	function addWalkingFrames() {
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;

      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 30; i++ ) {
        url = '../images/running/tile' + pad( i ) + '.png';
        WALKING_FRAMES.push( url );
      }
  	}

    function addShadowRunningFrames() {
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;

      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 23; i++ ) {
        url = '../images/running_shadow/tile' + pad( i ) + '.png';
        SHADOW_RUNNING_FRAMES.push( url );
      }
    }

  	function addMainLightIdle(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 39; i++ ) {
        url = '../images/mainlight_pulse/tile' + pad( i ) + '.png';
        MAIN_LIGHT_IDLE_FRAMES.push( url );
      }
  	}

  	function addBrightGemLeftCorrect(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 23; i++ ) {
        url = '../images/brightgem_left_correct/tile' + pad( i ) + '.png';
        BRIGHT_GEM_LEFT_CORRECT_FRAMES.push( url );
      }
  	}

  	function addBrightGemRightCorrect(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 23; i++ ) {
        url = '../images/brightgem_right_correct/tile' + pad( i ) + '.png';
        BRIGHT_GEM_RIGHT_CORRECT_FRAMES.push( url );
      }
  	}

  	function addBrightGemLeftDrop(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 32; i++ ) {
        url = '../images/brightgem_left_drop/tile' + pad( i ) + '.png';
        BRIGHT_GEM_LEFT_DROP_FRAMES.push( url );
      }
  	}

  	function addBrightGemRightDrop(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 32; i++ ) {
        url = '../images/brightgem_right_drop/tile' + pad( i ) + '.png';
        BRIGHT_GEM_RIGHT_DROP_FRAMES.push( url );
      }
  	}
  
  	function addFade(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 44; i++ ) {
        url = '../images/fade/tile' + pad( i ) + '.png';
        FADE_FRAMES.push( url );
      }
  	}

  	function addSideLight(){
      // Add loading zeros to numbers below 10
      var pad = ( n ) => { return n > 9 ? '0' + n : '00' + n; };
      var i, url;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 6; i++ ) {
        url = '../images/sidelight_appear/tile' + pad( i ) + '.png';
        SIDELIGHT_FRAMES.push( url );
      }
  	}

    function addMinimap(){
      var i, url ,texture;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 11; i++ ) {
        url = '../images/minimap/' + i.toString() + '.mp4';
        //texture = PIXI.Texture.from(url);
        //MINIMAPS.push(texture);
      }

    }
    function addBiomes(){
      var url1, url2,texture1,texture2;
      // Rather than passing the result arround, we'll simple expose the array
      // of frame urls as a global
      for( var i = 1; i < 11; i++ ) {
        for (var j = 1; j < 4; j++){
            url1 = '../images/Zones/' + i.toString() + '_frgrnd_' + j.toString() + '.png';
            url2 = '../images/Zones/' + i.toString() + '_bckgrnd_' + j.toString() + '.png';
            texture1 = PIXI.Texture.from(url1);
            texture2 = PIXI.Texture.from(url2);
            BIOMES_FOREGROUND.push(texture1);
            BIOMES_BACKGROUND.push(texture2); 
        }
        
      }
  	}
	
	function coinFlip(prob) {
	        return(Math.random() < prob) ? 1 : 0;
	    }


function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}
  
  var sendOnce = 0;
 function sendData(){
    //attempt = actionArray;
    //attemptArray.push(attempt);
    sendOnce = sendOnce + 1;
    if (sendOnce == 1){

        trial.id = trialCounter;
        trial.stage = currentLevel;
    //task.push(attemptArray);
        trialArray.push(trial);
        jsondata.session = trialArray;
        jsondata.uid = userinput;;
        var data = JSON.stringify(jsondata);
    //for testing locally..
    //var url = 'http://127.0.0.1:3000/SubjectData';
        var url = '/geode';
        var xhr = createCORSRequest('PUT',url)
        if (!xhr){
        throw new Error('CORS not supported');
        } 
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.onload = function(){
            var text = xhr.responseText;    
        };
        xhr.onerror = function(){
            alert("Error sending data to server");  
        };
        xhr.send(data);
        trial = new Object();
        console.log("data sent to server");  
        if (trialCounter == 200){
            state = end;
        }
        else {
            state = play;
        }

    }

}
 

//function sendData(){
  //remove 
    //score = score.substring(0,score.length - 1) + ']';
    //reward = reward.substring(0,reward.length - 1) + ']';
    //numflashleft = numflashleft.substring(0,numflashleft.length - 1) + ']';
    //numflashright = numflashright.substring(0,numflashright.length - 1) + ']';
   // reactiontime = reactiontime.substring(0,reactiontime.length - 1) + ']';
    //choice = choice.substring(0,choice.length - 1) + ']';
   // leftBinRecord = leftBinRecord.substring(0,leftBinRecord.length - 1) + ']';
   // rightBinRecord = rightBinRecord.substring(0,rightBinRecord.length - 1) + ']';
   // iti = iti.substring(0,iti.length - 1) + ']';

  //create json
    //var text = '{"username":' + '"' + user  + '"' + ',' + '"uid":' + '"'+ id + '"' + ',' +  '"hc":' +  totalScore  + ',' + score + ','  + reward + ',' +numflashleft + ',' + numflashright + ',' + reactiontime + ',' + choice + ',' + leftBinRecord + ',' + rightBinRecord + ',' + iti + '}';

 //   var jsondata = JSON.parse(text);
    //console.log(jsondata);
 //   var data = JSON.stringify(jsondata);
 //   var url = '/geode';
//    var xhr = createCORSRequest('PUT', url);
 //      if (!xhr) {
 //        throw new Error('CORS not supported');
 //      }
    // xhr.open("POST", myUrl, true);
     //xhr.setRequestHeader('X-PINGOTHER', 'pingpong');

//     xhr.setRequestHeader('Content-Type', 'application/json');
     
 //    xhr.onload = function() {
 //      var text = xhr.responseText;
       //console.log(text);
    //   var title = getTitle(text);
    //   alert('Response from CORS request to ' + url + ': ' + title);
 //    };

 //    xhr.onerror = function() {
 //      alert('Woops, there was an error making the request.');
 //    };
 //    xhr.send(data);

//     totalScore = 0;
   //  scoreMessage.text = totalScore.toString(); 

//     state = play;
//}

function getHighScore(){

 //get High Score
    var params = 'lim=1';
    var url = '/geode';
    var xhr = createCORSRequest('GET', url + "?" + params);
    if (!xhr) {
         throw new Error('CORS not supported');
    }
    // xhr.open("POST", myUrl, true);
     //xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
    xhr.onload = function() {
       var text = xhr.responseText;
       var obj = JSON.parse(text);
      // console.log(obj);
      // console.log(obj.msg[0].hc);
       globalScoreMessage.text = "High Score " + obj.msg[0].hc.toString();
       targetScore.text = obj.msg[0].hc.toString();
       targetScore.visible = 1;
       yourScoreMessage.text = "Your Score " + totalScore.toString();
       yourScoreMessage.visible=1;
    //   var title = getTitle(text);
    //   alert('Response from CORS request to ' + url + ': ' + title);
    }
    xhr.send(null);
    state = end;
}

function end(){
    gameOverScene.visible=1;
    gameScene.visible=0;
    flashStage.visible=0;
}
