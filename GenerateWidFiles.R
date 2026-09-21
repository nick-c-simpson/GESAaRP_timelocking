library('dplyr')
library('tidyr')
library('jsonlite')

# Load the 2AFCTasks

tafc_trials <- read.csv('RealData/2AFCTasks.csv') %>%
  filter(experiment == 'ExpTwo') %>%
  reframe(si = unique(subject_identifier))

write_json(tafc_trials$si, "WidFiles/Exp2.json", auto_unbox = TRUE)

# Load the 2AFCTasks

rep_trials <- read.csv('RealData/reproduction_tasks.csv') %>%
  filter(experiment_name == 'Replication') %>%
  reframe(si = unique(subject_identifier))

write_json(rep_trials$si, "WidFiles/Exp3Rep.json", auto_unbox = TRUE)

rep_trials <- read.csv('RealData/reproduction_tasks.csv') %>%
  filter(experiment_name == 'Second Replication') %>%
  reframe(si = unique(subject_identifier))

write_json(rep_trials$si, "WidFiles/Exp3SecRep.json", auto_unbox = TRUE)
