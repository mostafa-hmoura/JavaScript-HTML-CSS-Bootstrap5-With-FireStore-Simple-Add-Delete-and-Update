
const liste = document.querySelector('ul');
const form = document.querySelector('form');

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
  }

liste.addEventListener('click', e => {

	console.log(e);

	if(e.target.nodeName === "BUTTON" && e.target.innerText === "Delete"){
		
		if(confirm('Vous êtes sûr de supprimer ce cours ?')){

		let id = e.target.parentElement.getAttribute('data-id');
		
		db.collection("courses").doc(id).delete()
			.then( res => console.log("Data Deleted"))
			.catch( err => console.error("Data Not Deleted"))
		}
	}

	if(e.target.nodeName === "BUTTON" && e.target.innerText === "Edit"){
		
		
		const now = new Date();
		let id = e.target.parentElement.getAttribute('data-id');
		
		var course = db.collection("courses").doc(id);

		course.get().then((doc) => {
			if (doc.exists) {
				console.log("Document data");
				up(doc.data());
			} else {
				console.log("No such document!");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});


		const up = data => {
			
			let updateTitle = prompt('Modifier le Titre ', data.title);

			console.log(data);

			if(updateTitle != null){
				
				return course.update({
					title: updateTitle,
					created_at: firebase.firestore.Timestamp.fromDate(now)
				})
				.then(() => {
					console.log("Document successfully updated!");
				})
				.catch((error) => {
					// The document probably doesn't exist.
					console.error("Error updating document: ", error);
				});
			}

		}
		
	}

})

form.addEventListener('submit', e => {

	e.preventDefault();
	const now = new Date();

	const course = {
		title: form.course.value,
		created_at: firebase.firestore.Timestamp.fromDate(now)
	}

	db.collection("courses").add(course)
		.then( res => form.reset())
		.catch( res => console.error(res))

})

const addcourse = (cours,id) => {

	const html = `
		<li class="list-group-item" data-id="${id}">
			<h3>${capitalizeFirstLetter(cours.title)}</h3>
			<small>Created at : ${cours.created_at.toDate().toLocaleDateString()} ${cours.created_at.toDate().toLocaleTimeString()}</small>
			<br />
			<button class="btn btn-success btn-sm my-3">Edit</button>
			<button class="btn btn-danger btn-sm my-3">Delete</button>
		</li>	
	`;

	liste.innerHTML += html;
};

const deleteCourse = id => {

		const courses = document.querySelectorAll('li');
		courses.forEach( cours => {
			if(cours.getAttribute('data-id') === id) {
				cours.remove();
			}
		});

};

db.collection("courses").onSnapshot(snap => {
	console.log(snap.docChanges())
	snap.docChanges().forEach(element => {
		if(element.type == "added") addcourse(element.doc.data(),element.doc.id);
		 else if (element.type == "removed") deleteCourse(element.doc.id);
		 else if (element.type == "modified") {
			 deleteCourse(element.doc.id);
			 addcourse(element.doc.data(),element.doc.id);
		 }
	})
})



