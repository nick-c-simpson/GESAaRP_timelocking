library('dplyr')
library('tidyr')

## Experiment 2

# Read true data
real_data <- read.csv('RealData/2AFCTasks.csv') %>%
  filter(experiment == 'ExpTwo') %>%
  group_by(subject_identifier, practice) %>%
  mutate(trial_number = 1:n()) %>%
  ungroup() %>%
  select(protocol_sum, subject_identifier, direction, screen_duration, acceleration, practice, PID, trial_number, background_rotation)

# Read generated data
gen_data <- read.csv('GeneratedTrials/Exp2_trial_data.csv') %>%
  rename(
    c(
      'gen_acceleration' = 'acceleration',
      'gen_screen_duration' = 'screen_duration',
      'gen_direction' = 'direction',
      'gen_background_orientation' = 'background_orientation',
      'gen_practice' = 'practice',
      'gen_subject_identifier' = 'subject_identifier',
      'gen_trial_number' = 'trial_number',
    )
  )

# Combine the two dfs on only the subject_identifier and trial number
combined = real_data %>%
  inner_join(
    gen_data,
    by = join_by(
      'subject_identifier' == 'gen_subject_identifier',
      'trial_number' == 'gen_trial_number',
      'practice' == 'gen_practice'
    )
  )

# Check that everything matches
combined_check = combined %>%
  mutate(
    acceleration_matches = gen_acceleration == acceleration,
    screen_duration_matches = gen_screen_duration == screen_duration,
    direction_matches = gen_direction == direction,
    background_rotation_matches = gen_background_orientation == background_rotation
  ) %>%
  reframe(
    acceleration_correct = sum(acceleration_matches),
    acceleration_incorrect = sum(!acceleration_matches),
    screenduration_correct = sum(screen_duration_matches),
    screenduration_incorrect = sum(!screen_duration_matches),
    direction_correct = sum(direction_matches),
    direction_incorrect = sum(!direction_matches),
    backgroundrotation_correct = sum(background_rotation_matches),
    backgroundrotation_incorrect = sum(!background_rotation_matches)
  ) %>%
  pivot_longer(
    cols = ends_with('correct'),
    names_to = c('TrialComponent', 'Correctness'),
    values_to = 'TrialCount',
    names_sep = '_'
  )

print(combined_check)


## Experiment 3 Replication

# Read true data
real_data <- read.csv('RealData/reproduction_replication.csv') %>%
  group_by(subject_identifier, practice) %>%
  mutate(trial_number = 1:n()) %>%
  ungroup() %>%
  select(protocol_sum, subject_identifier, direction, flash_distance, acceleration, practice, trial_number)

# Read generated data
gen_data <- read.csv('GeneratedTrials/Exp3Rep_trial_data.csv') %>%
  select(acceleration, flash_distance, direction, subject_identifier, practice, trial_number) %>%
  rename(
    c(
      'gen_acceleration' = 'acceleration',
      'gen_flash_distance' = 'flash_distance',
      'gen_direction' = 'direction',
      'gen_practice' = 'practice',
      'gen_subject_identifier' = 'subject_identifier',
      'gen_trial_number' = 'trial_number',
    )
  )

# Combine the two dfs on only the subject_identifier and trial number
combined = real_data %>%
  inner_join(
    gen_data,
    by = join_by(
      'subject_identifier' == 'gen_subject_identifier',
      'trial_number' == 'gen_trial_number',
      'practice' == 'gen_practice'
    )
  )

# Check that everything matches
combined_check = combined %>%
  mutate(
    acceleration_matches = gen_acceleration == acceleration,
    flash_distance_matches = round(gen_flash_distance, 5) == round(flash_distance, 5), # Rounding as there is some computer error
    direction_matches = gen_direction == direction
  ) %>%
  reframe(
    acceleration_correct = sum(acceleration_matches),
    acceleration_incorrect = sum(!acceleration_matches),
    flashdistance_correct = sum(flash_distance_matches),
    flashdistance_incorrect = sum(!flash_distance_matches),
    direction_correct = sum(direction_matches),
    direction_incorrect = sum(!direction_matches)
  ) %>%
  pivot_longer(
    cols = ends_with('correct'),
    names_to = c('TrialComponent', 'Correctness'),
    values_to = 'TrialCount',
    names_sep = '_'
  )

print(combined_check)



## Experiment 3 Second Replication

# Read true data
real_data <- read.csv('RealData/reproduction_second_replication.csv') %>%
  group_by(subject_identifier, practice) %>%
  mutate(trial_number = 1:n()) %>%
  ungroup() %>%
  select(protocol_sum, subject_identifier, direction, flash_distance, acceleration, practice, trial_number)

# Read generated data
gen_data <- read.csv('GeneratedTrials/Exp3SecRep_trial_data.csv') %>%
  select(acceleration, flash_distance, direction, subject_identifier, practice, trial_number) %>%
  rename(
    c(
      'gen_acceleration' = 'acceleration',
      'gen_flash_distance' = 'flash_distance',
      'gen_direction' = 'direction',
      'gen_practice' = 'practice',
      'gen_subject_identifier' = 'subject_identifier',
      'gen_trial_number' = 'trial_number',
    )
  )

# Combine the two dfs on only the subject_identifier and trial number
combined = real_data %>%
  inner_join(
    gen_data,
    by = join_by(
      'subject_identifier' == 'gen_subject_identifier',
      'trial_number' == 'gen_trial_number',
      'practice' == 'gen_practice'
    )
  )

# Check that everything matches
combined_check = combined %>%
  mutate(
    acceleration_matches = gen_acceleration == acceleration,
    flash_distance_matches = round(gen_flash_distance, 5) == round(flash_distance, 5),
    direction_matches = gen_direction == direction
  ) %>%
  reframe(
    acceleration_correct = sum(acceleration_matches),
    acceleration_incorrect = sum(!acceleration_matches),
    flashdistance_correct = sum(flash_distance_matches),
    flashdistance_incorrect = sum(!flash_distance_matches),
    direction_correct = sum(direction_matches),
    direction_incorrect = sum(!direction_matches)
  ) %>%
  pivot_longer(
    cols = ends_with('correct'),
    names_to = c('TrialComponent', 'Correctness'),
    values_to = 'TrialCount',
    names_sep = '_'
  )

print(combined_check)
