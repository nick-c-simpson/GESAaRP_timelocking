var jsPsychMovingImage = (function (jspsych) {
  'use strict';

  const info = {
      name: "moving-image",
      parameters: {          
           /**
           * The size of the virtual space in meters
           */
          virtual_space_size: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Virtual Space Size",
            default: 4,
          },
          /**
           * The size of the image that moves
           */
          image_ratio: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Image Size",
            default: 0.1,
          },

          /**
           * The time at which the ball appears
           */
          start_time: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Start Time",
            default: 500,
          },

          /**
           * The screen duration in s
           */
          screen_duration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Screen Duration",
            default: 500,
          },

          /**
           * The acceleration in px/s^2
           */
          acceleration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Acceleration",
            default: 100,
          },

          /**
           * The movement direction (LEFT, RIGHT)
           */
          direction: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Direction",
            default: "DOWN",
          },

          /**
           * Accelerating key
           */
          accelerating_key: {
            type: jspsych.ParameterType.KEY,
            pretty_name: "Accelerating Key",
            default: 'f',
          },

          /**
           * Decelerating key
           */
          decelerating_key: {
            type: jspsych.ParameterType.KEY,
            pretty_name: "Decelerating Key",
            default: 'j',
          },
          /**
           * Trial number
           */
          trial_number: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Trial Number",
            default: 0,
          },
          /**
           * Number of trials
           */
          total_number_of_trials: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Number of trials",
            default: 0,
          },
          /**
           * Feedback
           */
          feedback: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Feedback",
            default: true,
          }, 
          use_cue: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Use Cue",
            default: false,
          },
           /**
           * Text of the cue
           */
          cue_type: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Cue Type",
            default: "SQUARE",
          },
          /**
           * Text size of the cue
           */
          cue_size: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Cue Size",
            default: 0.1,
          },
          /**
           * Colour of the cue
           */
          cue_colour: {
            type: jspsych.ParameterType.COLOUR,
            pretty_name: "Cue Colour",
            default: [{
                    red: 0,
                    green: 0,
                    blue: 0
                }]
          },
          /**
           * Start time of the cue
           */
          cue_start: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Cue Start",
            default: 0,
          },
          /**
           * Duration of the cue
           */
          cue_duration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Cue Duration",
            default: 0,
          },
          /**
           * The image as a background
           */
          background: {
            type: jspsych.ParameterType.IMAGE,
            pretty_name: "Background",
            default: null,
          },
          /**
           * The image that moves
           */
          moving_image: {
            type: jspsych.ParameterType.IMAGE,
            pretty_name: "Moving Image",
            default: null,
          },
          /**
           * Colour of the ball if no image
           */
          ball_colour: {
            type: jspsych.ParameterType.COLOUR,
            pretty_name: "Ball Colour",
            default: [{
              red: 0,
              green: 0,
              blue: 0
          }]
          },
          background_rotation: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Background Rotation",
            default: 0
          }
      },
  };
  /**
   * **moving-image**
   *
   *
   * @author Nick Simpson
   */
  class MovingImagePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          document.body.style.cursor = 'none';
          display_element.style.cursor = 'none';
          var show_ball = false;
          var show_cue = false;
          var response_can_be_made = false;
          var start_time;
          var cue_start_time;
          var cue_end_time;
          var ball_start_time;
          var ball_end_time;
          var key_press_time;
          var end_of_trial = false;
          //Data structure to hold response
          var response = {
            rt: null,
            key: null,
          };          
          var win_width = window.innerWidth;
          var win_height = window.innerHeight;
          var canvas_size = Math.min(win_width, win_height)*0.8;            
          var canvas_left = win_width/2-canvas_size/2;
          var canvas_top = win_height/2-canvas_size/2;          
          var radius = (canvas_size*trial.image_ratio)/2;
          var virtual_image_size = trial.image_ratio*trial.virtual_space_size;
          var background_image;
          if(trial.background != null){
            background_image = new Image();
            background_image.src = trial.background;
          } 
          var base_image;
          if(trial.moving_image != null){
            base_image = new Image();
            base_image.src = trial.moving_image;
          }
          var radians_rotation = 2*Math.PI*trial.background_rotation/360;
          var orientation_of_rotated_centre = Math.PI/4 + radians_rotation;
          var hypotenuse = Math.sqrt(2*((canvas_size/2)**2));
          //This shift incorporates a change of cos/sin necessary for each 90 degree rotation and the removal of the 90 degrees to make right angled triangle again
          var orientation_shift_for_maths = 2*(Math.PI/2)*(Math.floor(orientation_of_rotated_centre/(Math.PI/2)));
          //Sign is so that the shift occurs in the right direction
          var x_translation = canvas_size/2-(Math.sign(Math.cos(orientation_of_rotated_centre)))*Math.abs(hypotenuse*Math.cos(orientation_of_rotated_centre-orientation_shift_for_maths));
          var y_translation = canvas_size/2-(Math.sign(Math.sin(orientation_of_rotated_centre)))*Math.abs(hypotenuse*Math.sin(orientation_of_rotated_centre-orientation_shift_for_maths));

          //Organising the text to be in the right places - could be done nicer                   
          var new_html = `
          <p class="acc" id="feedback-text" style="padding-top:`+(-10+canvas_top/2)+`px; padding-bottom:`+(-10+canvas_top/2)+`px; background-color: rgb(120,120,120);width:`+win_width+`px;">       
          <p class="acc" id="accelerating-text" style=" padding-top:`+(-10+canvas_size/2)+`px; padding-bottom:`+(-10+canvas_size/2)+`px;  top:`+canvas_top+`px; width:`+canvas_left+`px">accelerating: a</p>     
          <p class="acc" style="left:`+canvas_left+`px; top:`+canvas_top+`px; width:`+(canvas_size)+`px; height:`+(canvas_size)+`px;"> </p>
          <p class="acc" id="decelerating-text" style="padding-top:`+(-10+canvas_size/2)+`px; padding-bottom:`+(-10+canvas_size/2)+`px; left:`+(canvas_left+canvas_size)+`px; top:`+canvas_top+`px;width:`+canvas_left+`px;">decelerating: d</p>  
          <p class="acc" id="trial-text" style="padding-top:`+(-10+canvas_top/2)+`px; padding-bottom:`+(-10+canvas_top/2)+`px; top:`+(canvas_size+canvas_top)+`px; width:`+win_width+`px;">`+trial.trial_number+`/`+trial.total_number_of_trials+`</p>          
          <canvas id="court" style="background-color:rgb(200, 200, 200); position:absolute; left:`+canvas_left+`px; top:`+canvas_top+`px;" width="`+canvas_size+`" height="`+canvas_size+`"></canvas>`;          

          // draw
          display_element.innerHTML = new_html;    

          const canvas = document.getElementById("court");
          const context = canvas.getContext("2d");                        
          
          var initial_speed = (((trial.virtual_space_size+virtual_image_size)/(trial.screen_duration/1000))-(trial.acceleration*(trial.screen_duration/1000))/2);                    
          var final_speed = (((trial.virtual_space_size+virtual_image_size)/(trial.screen_duration/1000))+(trial.acceleration*(trial.screen_duration/1000))/2);            
                  
          //Calculates how far across the screen the object should be given the start velocity, accelration, and start time
          function distance_travelled(){
            var now = new Date().getTime();
            var when_the_ball_should_be_shown;
            if(trial.use_cue){
              when_the_ball_should_be_shown = (start_time+trial.cue_duration+trial.cue_start+trial.start_time);
            } else {
              when_the_ball_should_be_shown = (start_time+trial.start_time);
            }
            var time_passed = 0.001*(now-when_the_ball_should_be_shown);
            if(1000*time_passed>trial.screen_duration){
              show_ball = false;
            }
            return initial_speed*time_passed+(trial.acceleration*time_passed*time_passed)/2 //s = ut+(1/2)at^2            
          }

          //Paints the images on the screen
          function make_visuals(){
            const canvas = document.getElementById("court");
            const context = canvas.getContext("2d");                
        
            if(show_ball){//Only draw if the start_time has been reached               
              var px_travelled = distance_travelled()*(canvas_size/trial.virtual_space_size);            
              if(trial.direction == "LEFT"){
                var origin_x = canvas_size-px_travelled+radius;
                var origin_y = canvas_size/2;
                if(origin_x<=-0.9*radius){
                  var time = new Date().getTime();
                  ball_end_time = time-start_time;
                  show_ball = false;        //If the object has left the screen, stop updating (stops object from returning)
                  response_can_be_made = true;
                }       
              } else if(trial.direction == "RIGHT"){
                var origin_x = px_travelled-radius;
                var origin_y = canvas_size/2;
                if(origin_x>=canvas_size+0.9*radius){
                  var time = new Date().getTime();
                  ball_end_time = time-start_time;              
                  show_ball = false;       //If the object has left the screen, stop updating (stops object from returning)
                  response_can_be_made = true;
                }   
              } else if(trial.direction == "UP"){
                var origin_x = canvas_size/2;
                var origin_y = canvas_size-px_travelled+radius;
                if(origin_y<=-0.9*radius){
                  var time = new Date().getTime();
                  ball_end_time = time-start_time;              
                  show_ball = false;       //If the object has left the screen, stop updating (stops object from returning)
                  response_can_be_made = true;
                }   
              } else if(trial.direction == "DOWN"){
                var origin_x = canvas_size/2;
                var origin_y = px_travelled-radius;
                if(origin_y>=canvas_size+0.9*radius){
                  var time = new Date().getTime();
                  ball_end_time = time-start_time;              
                  show_ball = false;       //If the object has left the screen, stop updating (stops object from returning)
                  response_can_be_made = true;
                }   
              }
            }                
            //Clear canvas
            context.clearRect(0,0,canvas_size, canvas_size);
            context.beginPath(); 
            //Draw background - or leave it gray
            if(trial.background != null){
              context.setTransform(1, 0, 0, 1, x_translation, y_translation);
              context.rotate(radians_rotation)
              context.drawImage(background_image, 0,0, canvas_size, canvas_size);
              context.setTransform(1, 0, 0, 1, 0,0);
              context.rotate(0)
            }   
            //Draw ball
            if(show_ball){
              if(trial.moving_image == null){
                context.fillStyle = "rgb("+trial.ball_colour.red+","+trial.ball_colour.green+","+trial.ball_colour.blue+")";
                context.arc(origin_x, origin_y, radius, 0, 2 * Math.PI);
                context.fill();
              } else {
                origin_x = origin_x-radius;
                origin_y = origin_y-radius;
                context.drawImage(base_image, origin_x, origin_y, 2*radius, 2*radius);
              }
            }
            //Draw cue
            context.moveTo(0,0);
            if(show_cue){
              context.fillStyle = "rgb("+trial.cue_colour.red+"," + trial.cue_colour.green+"," + trial.cue_colour.blue+")";
              if(trial.cue_type == "SQUARE"){
                context.fillRect(canvas_size*(1-trial.cue_size)/2, canvas_size*(1-trial.cue_size)/2, trial.cue_size*canvas_size, trial.cue_size*canvas_size);
              } else if(trial.cue_type == "TRIANGLE"){
                context.beginPath();
                context.moveTo(canvas_size/2, canvas_size*(1-trial.cue_size)/2);
                context.lineTo(canvas_size*(1-trial.cue_size)/2, canvas_size*(1+trial.cue_size)/2);
                context.lineTo(canvas_size*(1+trial.cue_size)/2, canvas_size*(1+trial.cue_size)/2);
                context.fill();
              } else {
                context.font = trial.cue_size*canvas_size+"px Arial";
                context.textAlign = "center";
                context.textBaseline = "middle"; 
                context.fillText(trial.cue_type, canvas_size/2, canvas_size/2);
              }
            }
            context.closePath();
            if(!end_of_trial){
              requestAnimationFrame(make_visuals);
            }
          }                  

          // function to end trial when it is time
          const end_trial = () => {
              end_of_trial = true;
              document.body.style.cursor = 'default';
              display_element.style.cursor = 'default';
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // kill keyboard listeners
              if (typeof keyboardListener !== "undefined") {
                  this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
              }
              //Get data from experiment
              var correct_response;
              var correct;
              if(trial.acceleration == 0){
                correct_response = NaN;
                correct =NaN;
              } else {
                if(trial.acceleration>0){
                  correct_response = trial.accelerating_key
                } else {
                  correct_response = trial.decelerating_key
                }
                //Is the response correct?
                if(correct_response == response.key){
                  correct = true;
                } else {
                  correct = false;
                }
              }              
            
              // gather the data to store for the trial                          
              var rt_from_ball = key_press_time-ball_end_time;

              var trial_data = {
                  direction: trial.direction,
                  screen_duration: trial.screen_duration,
                  acceleration: trial.acceleration,
                  start_time: trial.start_time,
                  background_rotation: trial.background_rotation,
                  initial_speed: initial_speed,
                  final_speed: final_speed,
                  correct_response: correct_response,
                  correct: correct,
                  key_response: response.key,
                  rt: response.rt,
                  ball_start_time: ball_start_time,
                  ball_end_time: ball_end_time,
                  key_press_time: key_press_time,
                  rt_from_ball: rt_from_ball,
                  cue_start_time: cue_start_time,
                  cue_end_time: cue_end_time
              };
              this.jsPsych.finishTrial(trial_data);
          };       

          function give_feedback(){
            var correct_response;
            if(trial.acceleration>0){
              correct_response = trial.accelerating_key
            } else {
              correct_response = trial.decelerating_key
            }
            const feedback_html = document.getElementById("feedback-text");
            //Is the response correct?
            if(correct_response == response.key){          
              feedback_html.innerHTML = "correct";
              feedback_html.style.color = "rgb(250,250,250)";
              window.setTimeout(function(){
                feedback_html.style.color = 'rgb(120,120,120)';
                end_trial();
              }, 1000);
            } else {
              feedback_html.innerHTML = 'incorrect';
              feedback_html.style.color = "rgb(250,250,250)";
              window.setTimeout(function(){
                feedback_html.style.color = 'rgb(120,120,120)';
                end_trial();
              }, 1000);
            }
          }        
          
          // function to handle responses by the subject
          var after_response = (info) => {     
            if(response_can_be_made){   
              jsPsych.pluginAPI.cancelAllKeyboardResponses()
              var time = new Date().getTime();
              key_press_time = time-start_time;                    
              if(info.rt){
                // only record the first response
                if (response.key == null) {
                  response = info;
                }      
                var button_pressed_text;   
                if(response.key == trial.accelerating_key){
                  button_pressed_text = document.getElementById("accelerating-text");;
                } else {
                  button_pressed_text = document.getElementById("decelerating-text");;
                }
                button_pressed_text.style.color = 'rgb(250,250,250)';
                window.setTimeout(function(){
                  button_pressed_text.style.color = 'rgb(200,200,200)';
                  if(trial.feedback){
                    give_feedback();
                  } else {
                    end_trial(); 
                  }       
                }, 500);
                         
              }                    
            }
          };          
          
          // start the response listener          
          var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: [trial.accelerating_key, trial.decelerating_key],
            rt_method: "performance",
            persist: true,
            allow_held_key: false,
          });         

          //Use a start time to calculate position of object over time
          start_time = new Date().getTime();
          //Animation code to update the screen
          requestAnimationFrame(make_visuals);

          var show_stimulus = () => {
            this.jsPsych.pluginAPI.setTimeout(() => {
              var time = new Date().getTime();
              ball_start_time = time-start_time;
              show_ball = true;
            }, trial.start_time); 
          }

          var remove_cue = () => {
            this.jsPsych.pluginAPI.setTimeout(() => {
              var time = new Date().getTime();
              cue_end_time = time-start_time;
              show_cue = false;
              show_stimulus();
            }, trial.cue_duration); 
          }

          if(trial.use_cue){
            window.setTimeout(function() {
              var time = new Date().getTime();
              cue_start_time = time-start_time;
              show_cue = true;
              remove_cue();
            }, trial.cue_start);
          } else {
            cue_start_time = 0;
            cue_end_time = 0;
            show_stimulus();
          }
        }        
  }
  MovingImagePlugin.info = info;

  return MovingImagePlugin;

})(jsPsychModule);
