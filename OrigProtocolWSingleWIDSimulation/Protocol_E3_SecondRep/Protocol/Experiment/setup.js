function input_defaults(conditions){
    if(!Object.hasOwn(conditions, 'virtual_space_distance')){
        conditions.virtual_space_distance = 4;
    }
    if(!Object.hasOwn(conditions, 'ball_size')){
        conditions.image_size = 0.1;
    }
    if(!Object.hasOwn(conditions, 'number_of_trials')){
        conditions.number_of_trials = 108;
    }
    if(!Object.hasOwn(conditions, 'distribution')){
        conditions.distribution = 'NEUTRAL';
    }
    if(!Object.hasOwn(conditions, 'direction')){
        conditions.direction = 'HORIZONTAL';
    }
    if(!Object.hasOwn(conditions, 'ball_colour')){
        conditions.colour = {
            red: 120,
            green: 120,
            blue: 120,
        };
    }
    if(!Object.hasOwn(conditions, 'shape')){
        conditions.shape = 'CIRCLE';
    }
    if(!Object.hasOwn(conditions, 'ball_start_time')){
        conditions.start_time = 1000;
    }
    if(!Object.hasOwn(conditions, 'practice')){
        conditions.practice = false;
    }
    if(!Object.hasOwn(conditions, 'background_colour')){
        conditions.background_colour = {
            red: 120,
            green: 120,
            blue: 120,
        };
    }
    if(!Object.hasOwn(conditions, 'flash_colour')){
        conditions.flash_colour = {
            red: 0,
            green: 0,
            blue: 0,
        };
    }
    if(!Object.hasOwn(conditions, 'flash_range')){
        conditions.flash_range = [0, 1];
    }
    if(!Object.hasOwn(conditions, 'flash_duration')){
        conditions.flash_duration = 100;
    }
    if(!Object.hasOwn(conditions, 'screen_durations')){
        conditions.screen_durations = [1250];
    }
    if(!Object.hasOwn(conditions, 'accelerations')){
        conditions.accelerations = [5.12];
    }
    if(!Object.hasOwn(conditions, 'background_image')){
        conditions.background_image = null;
    }

    return conditions;
}

function setup(conditions){
    var trial_variables = [];
    for(var cond = 0; cond<conditions.length; cond++){
        conditions[cond] = input_defaults(conditions[cond]);
        var distrib;
        if(conditions[cond].practice){
            distrib = [-3.2, 3.2];
        } else {
            distrib = [8, 6.4, 4.8, 3.2, 3.2, 3.2, 1.6, 1.6, 1.6, 1.6, 1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -1.6, -1.6, -1.6, -1.6, -1.6, -3.2, -3.2, -3.2, -4.8, -6.4, -8, 8, 6.4, 4.8, 3.2, 3.2, 3.2, 1.6, 1.6, 1.6, 1.6, 1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -1.6, -1.6, -1.6, -1.6, -1.6, -3.2, -3.2, -3.2, -4.8, -6.4, -8];
        }
        var screen_durations = new Array(distrib.length).fill(1000);
        //For each trial, generate a random number for flash time, that's about it!
        var number_of_trials_here = distrib.length;
        var flash_distances = Array.from({length: number_of_trials_here}, () => conditions[cond].flash_range[0] + Math.random() * (conditions[cond].flash_range[1] - conditions[cond].flash_range[0]));

        //Randomly assign whether feedback is given
        var feedback;
        var chance = 0;
        if(conditions[cond].practice){
            chance = 1
        }
        for(var dist = 0; dist < flash_distances.length; dist++){
            if(Math.random()>chance){
                feedback = false;
            } else {
                feedback = true;
            }
            trial_variables.push({
                acceleration: distrib[dist],
                screen_duration: screen_durations[dist],
                flash_distance: flash_distances[dist],
                flash_duration: conditions[cond].flash_duration,
                flash_colour: conditions[cond].flash_colour,
                ball_colour: conditions[cond].ball_colour,
                ball_size: conditions[cond].ball_size,
                ball_begin_time: conditions[cond].ball_begin_time,
                ball_start_time: conditions[cond].ball_start_time,
                direction: conditions[cond].direction,
                condition: conditions[cond].condition,
                feedback: feedback,
                question_type: "SEARCH",
                background: conditions[cond].background_image
            })
        }
    }
    return jsPsych.randomization.shuffle(trial_variables);
}

function flash_setup_vertical(practice){

    var ball_colour = {
        red: 0,
        green: 0,
        blue: 0,
    };

    var flash_colour = {
        red: 170,
        green: 170,
        blue: 170,
    };

    //var flash_range = [0.23333, 0.76667];
    var flash_range = [0.2, 0.8];
    //var screen_durations = [1250, 1687.5];
    var screen_durations = [1000, 1250];
    //var ball_size = 0.08888;
    var ball_size = 0.05;
    var ball_begin_time = 1000;

    var conditions = [{
        condition: 'DECELERATING',
        direction: 'UP',
        ball_colour: ball_colour,
        flash_colour: flash_colour,
        flash_range: flash_range,
        practice: practice,
        flash_duration: 50,
        ball_size: ball_size,
        ball_start_time: 1000,
        screen_durations: screen_durations,
        ball_begin_time: ball_begin_time
    },
    {
        condition: 'ACCELERATING',
        direction: 'DOWN',
        ball_colour: ball_colour,
        flash_colour: flash_colour,
        flash_range: flash_range,
        practice: practice,
        flash_duration: 50,
        ball_size: ball_size,
        ball_start_time: 1000,
        screen_durations: screen_durations,
        ball_begin_time: ball_begin_time
    }
    ]
    return setup(conditions);
}