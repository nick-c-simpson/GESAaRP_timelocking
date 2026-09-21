# GESAaRP_timelocking
A method for ensuring time-locked preregistation for the data in Experiments 2 and 3 in X.

# Logic
SHA256 keys are a cryptographic hash function which reads the bytes of a file and applies the SHA256 algorithm to generate a 64 digit key. This key can be used to check that the file has not been edited because the key is derived from the data within the file itself.

Here we use the SHA256 key from a zipped folder which contains within it the experiment script and the pre-registration document. This SHA256 key can therefore not be generated until the pre-registration is written and the expreiment code is written.

The SHA256 key is used to seed a random number generator (RNG) which is used to generate the trial order of the participants within the experiment. Specifically, the SHA256 key + the worker ID (a unique ID given to participants when using the JATOS online experiment platform) seeds the RNG so that each participant has a unique trial order that is still tied to the SHA256 key.

This process causes the trial order of the data itself to be dependent on the pre-registration document and the experiment script that generates the trial order, and therefore the data is proof that the pre-registration was written prior to data collection.

## Repository Meaning
This repository is designed to walk users through the steps to reproduce the trial order of each participant and thus demonstrates that the experiment was run after the pre-registration was written.

As a little aside, there is code for users to input the SHA256 key and a specific subject identifier and then run the experiment as the participant themselves would have seen. This is provided as there are minimal changes to the experiment code and is therefore an easier way to provide security that the process works.

# Files

`ProtocolZips` holds the zipped files present in OSF and used to generate SHA256 keys.

`RealData` holds the data output from the experiments and analysed in X.

`OrigProtocolWSingleWIDSimulation` is the unzipped `ProtocolZips` with a simulation of individual participant experiments when inputting the SHA256 key and a subject identifier.

`GenerateExperimentXTrials` holds the files necessary for `GenerateExperimentXTrials/generate_all_WID.html` to produce the trial order.

`GenerateWidFiles.R` creates a list of subject identifiers (worker IDs) from the real data

`CompareRealAndGenerated.R` compares the real data to the generated trials from this process.

## Created files

`WidFiles` holds the subject identifiers after running `GenerateWidFiles.R`

`GeneratedTrials` holds the output after running `GenerateExperimentXTrials/generate_all_WID.html`

# Method

## Generate worker IDs

The first step in the process is to generate the list of worker IDs (subject identifiers) that were used in the experiments. These WIDs are used in conjunction with the SHA256 key to seed individual participant RNGs.

By running the R script `GenerateWidFiles.R`, three files should be produced and saved in the folder `WidFiles`; `Exp2.json`, `Exp3Rep.json`, `Exp3SecRep.json`.

## Generate SHA256 keys

We next need to get the SHA256 keys from the zipped pre-registration folders. These SHA256 keys are the critical component of this process.

The zipped files are found in the folder `ProtocolZips`. These contain within them the pre-registration and experiment script for the specific experiment. To generate SHA256 keys you can:
1) Input the zip file to this website: https://emn178.github.io/online-tools/sha256_checksum.html
2) Manually extract the key by typing the following command into the terminal/command prompt with the correct file path:
   Windows: CertUtil -hashfile [FILENAME] SHA256
   Mac/Linux: sudo shasum -a 256 [FILENAME] 

You can save these SHA256 keys or remake them when needed.

## Run the experiment script to get trial orders

With a list of WIDs and the SHA256 keys, we can run the experiment script to generate the trials that participants would experience.

The html files needed to generate the trial order are found in the files `GenerateExperimentXTrials/generate_all_WID.html` where X can be replaced by 2, 3Rep, or 3SecRep for each of the experiments.
Opening these files should take you to a local html that allows you to select a `.json` file and input a SHA256 key. This looks unsafe but there is no data saved by the html script and the download is a simple .csv file in your downloads folder - feel free to run open when not connected to the internet.

The SHA256 key should be simply copied and pasted into the text input and the matching .json folder created in the folder `WidFiles` selected with the file selector. It might be easier to select the file first.

This html file should open the .json file and extract the subject identifiers that have been taken from the real data. For each of the subject identifiers, it sets the RNG seed with the SHA256 key and the subject identifier and runs the same process to generate the trial order. It saves a .csv file to your downloads with all of the trials for all subject identifiers. Once downloaded, this tab can be closed.

To keep the provided files working, move the downloaded .csv file to the folder `GeneratedTrials` and make sure the name is like `ExpX_trial_data.csv`. Otherwise, the file paths in the following step may need to be manually changed.

## Compare the trial order of generated trials with the real data

The generated files should match the real data. This step checks that this is true.

Open and run the R script `CompareRealAndGenerated.R`. If the previous steps have been correctly followed, the output should show that all trials are correct and none are incorrect. This is evidence that the pre-registration predates running of the experiment.

## What happens when the SHA256 key is not correct?

Feel free to change the SHA256 key entered into the .html files and see that many trials are now incorrect. This shows that it is exceedingly unlikely that the specific set of trials could be recreated if the pre-registration had been changed after data collection.
