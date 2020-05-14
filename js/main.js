// import * as rfc6902 from '/node_modules/rfc6902/index.js'
let Calendar = {
    vue: undefined,
    data: [],
    cells: [],
    render () {
        this.cells.forEach(cell => {
            this.vue.appendChild(cell)
        })
    }
}
const initcalendar = () => {
    let dates = new Date()
    for (let i = 0; i < 39; i++) {
        let cell = document.createElement('div')
        cell.innerHTML = dates.getDate()
        dates.setDate(dates.getDate() + 1) 
        Calendar.cells.push(cell)
        Calendar.vue = document.getElementById('calendar')
    }
    Calendar.render()
}
class Clinics {
    constructor () {
        this.data = {}
    }
    fetch () {
        xhr = new XMLHttpRequest()
        xhr.open('GET', 'http://localhost:3000/clinics', false)
        xhr.send()
        if(xhr.status !== 200) {
            alert("error")
        } else {
            rfc6902.applyPatch(this.data, JSON.parse(xhr.response))
        }        
    }
    getData () {
        return this.data
    }
}
class ClinicView {
    constructor (el, clinics) {
        this.el = el
        this.clinics = clinics
        this.children = []
    }
    render () {
        Object.values(this.clinics.data).forEach(clinic => {
            let option = document.createElement('option')
            option.innerHTML = clinic.name
            this.children.push(option)
            this.el.appendChild(option)
        })       
    }
}
window.onload = function () {
xhr = new XMLHttpRequest()
xhr.open('GET', 'http://localhost:3000/doctors', false)
xhr.send()
let doctorsData = {}
if(xhr.status !== 200) {
    alert("error")
} else {
    let doctors = document.getElementById('doctors')
    let opt
    rfc6902.applyPatch(doctorsData, JSON.parse(xhr.response))
    Object.values(doctorsData).forEach(doctor => {
       opt =  document.createElement('option')
       opt.value = doctor.Name
       opt.innerText = doctor.Name
       doctors.appendChild(opt)
    });
}
initcalendar()
let clinics = new Clinics()
clinics.fetch()
let clinicView = new ClinicView(document.getElementById('clinics'), clinics)
clinicView.render()
}