window.onload = main;
function main() {
    people = [];
    currPerson = 0;
    currPhoto = 0;
    fetch('/uploads/data.json').then(response => response.json()).then(json => processJSON(json)).catch(error => console.error('Error fetching data:', error));;


    slideshow = document.getElementById('slideshow');
    nextButton = document.getElementById('next');
    prevButton = document.getElementById('back');
    nextPersonButton = document.getElementById('nextPerson');
    prevPersonButton = document.getElementById('backPerson');

    accountName = document.getElementById('accountName');
    accountHandle = document.getElementById('accountHandle');
    accountSchool = document.getElementById('accountSchool');
    accountBio = document.getElementById('accountBio');

    rejectButton = document.getElementById('reject');
    approveButton = document.getElementById('approve');

    num = document.getElementById('num');
    displayStatus = document.getElementById('status');


    function processJSON(data) {
        for (i = 0; i < data.length; i++) {
            people.push(data[i]);
        }
        updatePhoto();
        console.log(people);

    }

    function updatePhoto() {
        if (people[currPerson] && people[currPerson].images && people[currPerson].images[currPhoto]) {
            slideshow.src = people[currPerson].images[currPhoto];
            accountName.textContent = people[currPerson].name;
            accountHandle.textContent = people[currPerson].handle;
            accountSchool.textContent = people[currPerson].school;
            accountBio.textContent = people[currPerson].bio;
            num.textContent = currPerson;
        } else {
            console.log('No image found for current person and photo index');
            slideshow.src = 'uploads/corona.png';
            accountName.textContent = "no more posts in the queue...";
        }

    }

    nextButton.onclick = next;
    prevButton.onclick = prev;
    nextPersonButton.onclick = nextPerson;
    prevPersonButton.onclick = prevPerson;


    reject.addEventListener('click', function(e) {
        if (people.length > 0) {
            console.log('reject for %s was clicked', people[currPerson].handle);

            data = {handle: people[currPerson].handle};
            console.log(JSON.stringify(data));

            const options = {
                method: 'POST',
                url: '/rejectClick',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(data)
            };


            fetch('/rejectClick', options).then(function(response) {
                if(response.ok) {
                    console.log('%s post successfully removed', people[currPerson].handle);
                    displayStatus.innerHTML = `<b>${people[currPerson].handle} rejected and removed from queue</b>`
                    removePerson(people[currPerson].handle);
                } else {
                    throw new Error('reject request failed');
                }
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            console.log('reject pressed but no photos in queue');
        }
    });

    approve.addEventListener('click', function(e) {
        if (people.length > 0) {
            console.log('approve for %s was clicked', people[currPerson].handle);

            data = {handle: people[currPerson].handle};
            console.log(JSON.stringify(data));

            const options = {
                method: 'POST',
                url: '/approveClick',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(data)
            };


            fetch('/approveClick', options).then(function(response) {
                if(response.ok) {
                    console.log('%s post successfully approved & removed', people[currPerson].handle);
                    displayStatus.innerHTML = `<b>${people[currPerson].handle} approved and removed from queue</b>`
                    removePerson(people[currPerson].handle);
                } else {
                    throw new Error('approve request failed');
                }
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            console.log('approve pressed but no photos in queue');
        }
    });


    function next() {
        if (people.length > 0) {
            if (currPhoto != people[currPerson].images.length - 1) {
                currPhoto++;
                updatePhoto();
            } else if (currPhoto == people[currPerson].images.length - 1) {
                currPhoto = 0;
                updatePhoto();
            }
        } else {
            console.log('next pressed but no photos in queue');
        }
    }

    function prev() {
        if (people.length > 0) {
            if (currPhoto != 0) {
                currPhoto--;
                updatePhoto()
            } else if (currPhoto == 0) {
                currPhoto = people[currPerson].images.length - 1;
                updatePhoto();
            }
        } else {
            console.log('back pressed but no photos in queue');
        }
    }

    function nextPerson() {
        if (people.length > 0) {
            if (currPerson != people.length - 1) {
                currPerson++;
                currPhoto = 0;
                updatePhoto();
            } else if (currPerson == people.length - 1) {
                currPerson = 0;
                currPhoto = 0;
                updatePhoto();
            }
        } else {
            console.log('next person pressed but no photos in queue');
        }
    }

    function prevPerson() {
        if (people.length > 0) {
            if (currPerson != 0) {
                currPerson--;
                currPhoto = 0;
                updatePhoto()
            } else if (currPerson == 0) {
                currPerson = people.length - 1;
                currPhoto = 0;
                updatePhoto();
            }
        } else {
            console.log('back person pressed but no photos in queue');
        }
    }

    function removePerson(handle) {
        newPeople = [];
        if (people.size != 1) {
            for (i = 0; i < people.length; i++) {
                if (people[i].handle != handle) {
                    newPeople.push(people[i]);
                }
                if (i == people.length - 1) {
                    currPerson = 0;
                    currPhoto = 0;
                }
            }
        }
        people = newPeople;
        console.log("after removing person: ");
        console.log(people);
        updatePhoto();
    }

}
