var jsPsychFlashFind = (function (jspsych) {
    'use strict';

    const info = {
    name: "flash_find",
    parameters: {
        ball_colour: {
            type: jspsych.ParameterType.OBJECT,
            pretty_name: "Ball Colour",
            default: {
                red: 255,
                green: 255,
                blue: 255
            },
        },
        flash_colour: {
            type: jspsych.ParameterType.OBJECT,
            pretty_name: "Flash Colour",
            default: {
                red: 255,
                green: 255,
                blue: 255
            },
        }, 
        flash_distance: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Flash Time",
            default: 0.5,
        },
        flash_duration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Flash Duration",
            default: 50,
        },
        /**
         * Ball size as ratio of screen size
         */
        ball_size: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Ball Size",
            default: 0.1,
        },
        /**
         * Ball start time
         */
        ball_start_time: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Ball Start Time",
            default: 1000,
        },
        /**
         * Acceleration
         */
        acceleration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Acceleration",
            default: 0,
        },
        /**
         * Screen duration
         */
        screen_duration: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Screen Duration",
            default: 1000,
        },
        /**
         * Simulated distance
         */
        virtual_space_size: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Virtual Space Size",
            default: 4,
        },
        /**
         * Direction of motion
         */
        direction: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Direction",
            default: "LEFT",
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
        give_feedback: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Give Feedback",
            default: false,
        },
        /**
         * The image as a background
         */
        background: {
            type: jspsych.ParameterType.IMAGE,
            pretty_name: "Background",
            default: null,
        },
        time_ball_shown_at_beginning: {
            type: jspsych.ParameterType.DOUBLE,
            pretty_name: "Time that the ball is shown at the beginning before motion",
            default: 0,
        },
    },
};
/**
 *
 * jsPsych plugin for flash find
 *
 * @author Nick Simpson
 * @see 
 */
class FlashFindPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }
    trial(display_element, trial) { 
        var start_time = new Date().getTime();
        var response = {
            x_click: null,
            y_click: null,
            rt: null
        };
        var ball_pos = {
            x: null,
            y: null
        };
        var rtfromball;
        var mouse_positions = [];
        var virtual_image_size = trial.ball_size*trial.virtual_space_size;
        var initial_speed = (((trial.virtual_space_size+virtual_image_size)/(trial.screen_duration/1000))-(trial.acceleration*(trial.screen_duration/1000))/2);                    
        var final_speed = (((trial.virtual_space_size+virtual_image_size)/(trial.screen_duration/1000))+(trial.acceleration*(trial.screen_duration/1000))/2);
        var win_width = window.innerWidth;
        var win_height = window.innerHeight;
        var canvas_size = Math.min(win_width, win_height)*0.9;
        var radius = (canvas_size*trial.ball_size)/2;
        var show_ball = false;
        var ball_at_beginning = false;
        var animation;
        var canvas_left = win_width/2-canvas_size/2;
        var canvas_top = win_height/2-canvas_size/2;
        var flash = false;
        var end_of_trial = false;
        var allow_response = false;
        var background_image;
        if(trial.background != null){
            background_image = new Image();
            background_image.src = trial.background;
        } 

        //s = u*t+(1/2)*a*t^2
        //t = ( -u +- sqrt(u^2 - 4 * (1/2) * a * -s) )/( 2 * (1/2) * a )
        // If a = 0, s = ut, t = s/u
        var true_flash_time;
        var flash_dist_travelled = trial.flash_distance*trial.virtual_space_size;
        if(trial.acceleration == 0){
            true_flash_time = flash_dist_travelled/initial_speed;
        } else {
            // Calculate the flash time
            var inside_sqrt = initial_speed**2 + 2*trial.acceleration*flash_dist_travelled;
            if(inside_sqrt > 0){
                var time_sol_one = (-initial_speed + Math.sqrt(inside_sqrt))/trial.acceleration;
                if(time_sol_one > 0 && time_sol_one < 0.001*trial.screen_duration){
                    true_flash_time = time_sol_one;
                } else {
                    var time_sol_two = (-initial_speed - Math.sqrt(inside_sqrt))/trial.acceleration;
                    if(time_sol_two > 0 && time_sol_two < trial.screen_duration){
                        true_flash_time = time_sol_two;
                    }
                }
            }
        }

        var flash_pos;
        var flash_distance_px = trial.flash_distance*canvas_size;

        if(trial.direction == "LEFT"){
            flash_pos = {
                x: canvas_size-flash_distance_px-radius,
                y: canvas_size/2
            };
        } else if(trial.direction == "RIGHT"){
            flash_pos = {
                x: flash_distance_px+radius,
                y: canvas_size/2
            };
        } else if(trial.direction == "UP"){
            flash_pos = {
                x: canvas_size/2,
                y: canvas_size-flash_distance_px-radius
            };
        } else if(trial.direction == "DOWN"){
            flash_pos = {
                x: canvas_size/2,
                y: flash_distance_px+radius
            };
        }  

        function distance_travelled(){
            var now = new Date().getTime();
            var time_passed = 0.001*(now-(start_time+trial.ball_start_time+trial.time_ball_shown_at_beginning));
            if(time_passed < 0){
                time_passed = 0;
            }
            if(1000*time_passed>trial.screen_duration){
                show_ball = false;
            }
            // divide by 2000, we turn the ms into the seconds, and we divide y 2 so that its either side
            if(time_passed > true_flash_time - (trial.flash_duration/2000) && time_passed < true_flash_time + (trial.flash_duration/2000)){
                flash = true;
            } else {
                flash = false;
            }
            return(initial_speed*time_passed+(trial.acceleration*time_passed*time_passed)/2) //s = ut+(1/2)at^2
        }

        function find_ball_position(){
            var px_travelled = distance_travelled()*(canvas_size/trial.virtual_space_size);
            if(trial.direction == "LEFT"){
                var origin_x = canvas_size-px_travelled-radius;
                var origin_y = canvas_size/2;
                if(origin_x<=-0.9*radius){
                    show_ball = false;
                }       
            } else if(trial.direction == "RIGHT"){
                var origin_x = px_travelled+radius;
                var origin_y = canvas_size/2;
                if(origin_x>=canvas_size+0.9*radius){    
                    show_ball = false;
                }   
            } else if(trial.direction == "UP"){
                var origin_x = canvas_size/2;
                var origin_y = canvas_size-px_travelled-radius;
                if(origin_y<=-0.9*radius){           
                    show_ball = false;
                }   
            } else if(trial.direction == "DOWN"){
                var origin_x = canvas_size/2;
                var origin_y = px_travelled+radius;
                if(origin_y>=canvas_size+0.9*radius){        
                    show_ball = false;
                }   
            }  
            return({
                x: origin_x,
                y: origin_y
            })
        }
        var new_html = `
        <div class='feedback-box', style="top: 0px; height: `+(win_height-(canvas_top+canvas_size))+`px;">
            <p id="feedback-text" style="color: rgb(120, 120, 120); padding-top:`+(-16+canvas_top/2)+`px; padding-bottom:`+(-16+canvas_top/2)+`px;"> </p>          
        </div>
        <div class='trial-box', style="top: `+(canvas_top+canvas_size)+`px; height: `+(win_height-(canvas_top+canvas_size))+`px;">
            <p class="flash-trial-counter" id="trial-text" style="padding-top:`+(-16+canvas_top/2)+`px; padding-bottom:`+(-16+canvas_top/2)+`px;">`+trial.trial_number+`/`+trial.total_number_of_trials+`</p>          
        </div>
        <canvas class="court" id="canvas" style="position:absolute; left:`+canvas_left+`px; top:`+canvas_top+`px;" width="`+canvas_size+`" height="`+canvas_size+`"></canvas>`;

        display_element.innerHTML = new_html;
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        context.width = canvas_size;
        context.height = canvas_size;
        
        function make_visuals(){
            context.clearRect(0,0,canvas_size, canvas_size);
            context.beginPath();
            if(trial.background != null){
                context.drawImage(background_image, 0,0, canvas_size, canvas_size);
            } 
            if(show_ball){
                ball_pos = find_ball_position();
                if(flash){
                    context.fillStyle = "rgb("+trial.flash_colour.red+"," + trial.flash_colour.green+"," + trial.flash_colour.blue+")";    
                } else {
                    context.fillStyle = "rgb("+trial.ball_colour.red+"," + trial.ball_colour.green+"," + trial.ball_colour.blue+")";
                }
                context.arc(ball_pos.x, ball_pos.y, trial.ball_size*context.width/2, 0, 2 * Math.PI);
            }
            context.fill();
            context.closePath();
            if(!end_of_trial){
                requestAnimationFrame(make_visuals);
            }
        }

        //Use a start time to calculate position of object over time
        start_time = new Date().getTime();
        //Animation code to update the screen
        requestAnimationFrame(make_visuals);

        const end_trial = () => {
            // kill any remaining setTimeout handlers
            this.jsPsych.pluginAPI.clearAllTimeouts();
            clearInterval(animation);
            // kill keyboard listeners
            if (typeof keyboardListener !== "undefined") {
                this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }                    
           
            var trial_data = {
                rt: response.rt,
                x_click: response.x_click-canvas_left,
                y_click: response.y_click-canvas_top,
                x_flash: flash_pos.x,
                y_flash: flash_pos.y,
                canvas_size: canvas_size,
                mouse_positions: mouse_positions,
                flash_time: true_flash_time,
                initial_speed: initial_speed,
                final_speed: final_speed,
                background: trial.background,
                start_time: trial.ball_start_time,
                virtual_space_size: trial.virtual_space_size,
                image_ratio: trial.ball_size,
                feedback: trial.give_feedback,
                rt_from_ball: rtfromball,
                flash_distance: trial.flash_distance,
                flash_duration: trial.flash_duration,
                flash_colour: trial.flash_colour,
                screen_duration: trial.screen_duration,
                ball_colour: trial.ball_colour,
                ball_size: trial.ball_size,
                trial_number: trial.trial_number,
                ball_start_time: trial.ball_start_time,
                acceleration: trial.acceleration,
                direction: trial.direction
            };                        

            // move on to the next trial
            this.jsPsych.finishTrial(trial_data);
        };
        const search_feedback = () => {
            var pix_diff = Math.abs((response.y_click-canvas_top) - flash_pos.y);
            var pix_ball = trial.ball_size*context.width;
            var ball_diff = pix_diff/pix_ball;
            var feedback_box = document.getElementById("feedback-text");
            feedback_box.innerHTML = (Math.round(10*ball_diff))/10 + " ball(s) away.";
            feedback_box.style.color = 'rgb(200, 200, 200)';
            this.jsPsych.pluginAPI.setTimeout(() => {
                end_trial()
            }, 1000);
        }

        const start_search = () => {
            clearInterval(animation);
            var borders = document.getElementsByClassName("acc");
            for(var border = borders.length-1; border>=0; border--){
                borders[border].className = "acc_cursor";
            }
            make_visuals();
            var tick = new Date().getTime();
            function printMousePos(event) {
                if(allow_response){
                    var tock = new Date().getTime();
                    canvas.removeEventListener("click", printMousePos);
                    canvas.onmousemove = function(event){};
                    response.rt = tock-start_time;
                    rtfromball = tock-tick;
                    response.x_click = event.clientX;
                    response.y_click = event.clientY;
                    if(trial.give_feedback){
                        search_feedback();
                    } else {
                        end_trial();
                    }
                }
            }
            canvas.addEventListener("click", printMousePos);
            canvas.onmousemove = function(event){
                allow_response = true;
                context.clearRect(0,0,canvas_size, canvas_size);
                context.beginPath();
                if(trial.background != null){
                    context.drawImage(background_image, 0,0, canvas_size, canvas_size);
                } 
                context.fillStyle = "rgb(0,0,0)";
                mouse_positions.push({
                    x: event.clientX-canvas_left,
                    y: event.clientY-canvas_top,
                    t:  new Date().getTime() - tick
                });
                context.arc(canvas_size/2, event.clientY-canvas_top, trial.ball_size*context.width/6, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
            }
        }

        const start_ball = () => {
            this.jsPsych.pluginAPI.setTimeout(() => {
                show_ball = false;
                end_of_trial = true;
                start_search();
            }, trial.screen_duration);
        }

        const hold_ball = () => {
            this.jsPsych.pluginAPI.setTimeout(() => {
                ball_at_beginning = false;
                start_ball();
            }, trial.time_ball_shown_at_beginning);
        }

        this.jsPsych.pluginAPI.setTimeout(() => {
            show_ball = true;
            ball_at_beginning = true;
            hold_ball();
        }, trial.ball_start_time);
    }      
}

FlashFindPlugin.info = info;

return FlashFindPlugin;

})(jsPsychModule);
