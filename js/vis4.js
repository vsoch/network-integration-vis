
// Serial Xhr request, if web worker not available
function get_json(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);  // synchronous request
    xhr.send(null);
    return JSON.parse(xhr.responseText);
}


data = get_json("../data/network_norm.json");

var camera;
var scene;
var renderer;
var cubeMesh;

var clock;
var deltaTime;

var particleSystem;

init();
animate();

function init() {

    clock = new THREE.Clock(true);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 50;
    
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, -1, 1 ).normalize();
    scene.add(light);
     
    particleSystem = createParticleSystem();
    scene.add(particleSystem);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, true );
        
    render();
}

function createParticleSystem() {
	
	// The number of particles in a particle system is not easily changed.
    var particleCount = data.length;
    
    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    var particles = new THREE.Geometry();

    // vertex colors
    var colors = [];
    for( var i = 0; i < data.length; i++ ) {

        colors[i] = new THREE.Color();
        colors[i].setHSL( data[i]['value'], 1.0, 0.5 );
    }

    particles.colors = colors;

    // Create the vertices and add them to the particles geometry
    data.forEach(function(dat){
        var y = dat['x'] * 800 + 400;
        var x = dat['y'] * 800 + 500;
        var z = dat['value'] * 200 -400;

	// Create the vertex
        var particle = new THREE.Vector3(x, y, z);
		
	// Add the vertex to the geometry
	particles.vertices.push(particle);

    })
			      
    // Create the material that will be used to render each vertex of the geometry
    var particleMaterial = new THREE.PointsMaterial({
                         size: 12,
			 transparent: true,
                         opacity: 0.7,
                         vertexColors: THREE.VertexColors			 
			});
	 
    // Create the particle system
    particleSystem = new THREE.Points(particles, particleMaterial);

    return particleSystem;	
}

function animate() {
    deltaTime = clock.getDelta();
    controls.update();    
    render();
    requestAnimationFrame( animate );
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}
