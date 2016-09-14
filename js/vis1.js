    
var mContainer;
var mCamera, mRenderer;
var mControls;

var mScene;

var mParticleSystem;
var mParticleCount;

var mTime = 10.0;

window.onload = function() {
    init();
};

function init() {
    initTHREE();
    initControls();
    initParticleSystem();
    requestAnimationFrame(tick);
    window.addEventListener('resize', resize, false);
}

function initTHREE() {
    mRenderer = new THREE.WebGLRenderer({antialias:false});
    mRenderer.setSize(window.innerWidth, window.innerHeight);

    mContainer = document.getElementById('three-container');
    mContainer.appendChild(mRenderer.domElement);

    mCamera = new THREE.PerspectiveCamera(60, (window.innerWidth / window.innerHeight), 1, 10000);
    mCamera.position.z = 400;

    mScene = new THREE.Scene();

    var light;

    light = new THREE.DirectionalLight(0xAD2959, 1);
    light.position.set(0, 1, 0);
    mScene.add(light);

    light = new THREE.DirectionalLight(0x095062, 1);
    light.position.set(0, -1, 0);
    mScene.add(light);
}

function initControls() {
    mControls = new THREE.OrbitControls(mCamera, mRenderer.domElement);
}

// Serial Xhr request, if web worker not available
function get_json(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);  // synchronous request
    xhr.send(null);
    return JSON.parse(xhr.responseText);
}

function initParticleSystem() {
   
    var data = get_json("data/network_nonzero.json");

    mParticleCount = data.length;

    // the geometry of each particle
    var prefabGeometry = new THREE.TetrahedronGeometry(2);
    // the geometry for all particles, stored in one buffer
    // the data (vertex position, uv and index) of the prefabGeometry will be duplicated x mParticleCount
    var bufferGeometry = new THREE.BAS.PrefabBufferGeometry(prefabGeometry, mParticleCount);

    // generate additional geometry data
    var i, j, offset;

    // aPosition is a THREE.BufferAttribute that stores the position of each particle in the scene
    var aPosition = bufferGeometry.createAttribute('aPosition', 3);
    var spread = 400;

    offset = 10;

    data.forEach(function(dat) {

            var x = (dat["x"] * 3) - 100;
            var y = (dat["y"] * 3);
            var z = dat["value"] * 100;

            for (j = 0; j < prefabGeometry.vertices.length; j++) {
                aPosition.array[offset++] = x;
                aPosition.array[offset++] = y;
                aPosition.array[offset++] = z;
            }
        });

        // store the same position for each particle

        // aAxis is a THREE.BufferAttribute that stores the local rotation axis for each particle
        var aAxis = bufferGeometry.createAttribute('aAxis', 3);
        var axis = new THREE.Vector3();

        offset = 0;

        data.forEach(function(dat){

            // a random axis (must be normalized, or things will get funky)
            axis.x = THREE.Math.randFloatSpread(2);
            axis.y = THREE.Math.randFloatSpread(2);
            axis.z = THREE.Math.randFloatSpread(2);
            axis.normalize();

            // store the same axis for each particle
            for (j = 0; j < prefabGeometry.vertices.length; j++) {
                aAxis.array[offset++] = axis.x;
                aAxis.array[offset++] = axis.y;
                aAxis.array[offset++] = axis.z;
            }

        }) 

        // this is where the magic happens!

        var material = new THREE.BAS.PhongAnimationMaterial(
        // custom parameters & THREE.MeshPhongMaterial parameters
        {
            shading: THREE.FlatShading,
            // definitions of extra uniforms used in the shader
            uniforms: {
                // uTime is used to calculate the rotation of each particle
                uTime:{type:'f', value:0}
            },
            // glsl functions that should be inserted into the vertex shader
            shaderFunctions: [
                THREE.BAS.ShaderChunk['quaternion_rotation']
            ],
            // glsl parameters that should be inserted into the vertex shader
            // these must match the custom uniforms of this PhongAnimationMaterial
            // and the custom attributes of the PrefabBufferGeometry
            shaderParameters: [
                'uniform float uTime;',
                'attribute vec3 aPosition;',
                'attribute vec3 aAxis;'
            ],
            // glsl code that should be inserted at the start of the vertex shader body (after 'void main() {')
            shaderVertexInit: [
                // set the angle based on time (which is increased every frame)
                // this is quite lazy, but efficient
                'float angle = uTime;',
                // create a quaternion based on the axis attribute and the angle
                // the 'quatFromAxisAngle' function is defined in THREE.BAS.ShaderChunk['quaternion_rotation']
                'vec4 tQuat = quatFromAxisAngle(aAxis, angle);'
            ],
            // glsl code used to transform the vertex normal
            // 'objectNormal' is the temporary register used inside THREE.MeshPhongMaterial.vertexShader
            // this code will be inserted before any other transformations
            shaderTransformNormal: [
                // use the quaternion created in 'shaderVertexInit' to rotate the normal
                // the 'rotateVector' function is defined in THREE.BAS.ShaderChunk['quaternion_rotation']
                'objectNormal = rotateVector(tQuat, objectNormal);'
            ],
            // glsl code used to transform the vertex position
            // 'transformed' is the temporary register used inside THREE.MeshPhongMaterial.vertexShader
            // this code will be inserted before any other transformations
            shaderTransformPosition: [
                // use the quaternion created in 'shaderVertexInit' to rotate the vertex position
                'transformed = rotateVector(tQuat, transformed);',
                // translate the rotated vertex position
                // the order of transformation matters, just like with matrices
                'transformed += aPosition;'
            ]
        },
        // THREE.MeshPhongMaterial uniforms
        {
            diffuse: 0xffffff, // color
            specular: 0xFBE087,
            shininess: 80
        }
    );

    // it's just a mesh!
    mParticleSystem = new THREE.Mesh(bufferGeometry, material);
    mScene.add(mParticleSystem);

}


function tick() {
    update();
    render();

    mTime += (1/60);

    requestAnimationFrame(tick);
}

function update() {
    mControls.update();

    // update the uTime attribute of the particle system
    mParticleSystem.material.uniforms['uTime'].value = mTime;
}

function render() {
    mRenderer.render(mScene, mCamera);
}

function resize() {
    mCamera.aspect = window.innerWidth / window.innerHeight;
    mCamera.updateProjectionMatrix();

    mRenderer.setSize(window.innerWidth, window.innerHeight);
}

/////////////////////////////////////
// THREE.BAS - https://github.com/zadvorsky/three.bas
/////////////////////////////////////

THREE.BAS = {};

// for future reference. currently unused
THREE.BAS.Easing = {
    Linear:0,

    QuadIn:1,
    QuadOut:2,
    QuadInOut:3,

    CubicIn:4,
    CubicOut:5,
    CubicInOut:6
};

THREE.BAS.ShaderChunk = {};

THREE.BAS.ShaderChunk["animation_time"] = "float tDelay = aAnimation.x;\nfloat tDuration = aAnimation.y;\nfloat tTime = clamp(uTime - tDelay, 0.0, tDuration);\nfloat tProgress = ease(tTime, 0.0, 1.0, tDuration);\n";

THREE.BAS.ShaderChunk["cubic_bezier"] = "vec3 cubicBezier(vec3 p0, vec3 p1, vec3 c0, vec3 c1, float t)\n{\n    vec3 tp;\n    float tn = 1.0 - t;\n\n    tp.xyz = tn * tn * tn * p0.xyz + 3.0 * tn * tn * t * c0.xyz + 3.0 * tn * t * t * c1.xyz + t * t * t * p1.xyz;\n\n    return tp;\n}\n";

THREE.BAS.ShaderChunk["ease_functions"] = "float ease(float t, float b, float c, float d, float s) {\n#if EASE_FUNCTION == 0\n    return c * ((t = t / d - 1.0) * t * t + 1.0) + b;\n#endif\n#if EASE_FUNCTION == 1\n    return -c * ((t = t / d - 1.0) * t * t * t - 1.0) + b;\n#endif\n\n#if EASE_FUNCTION == 2\n    return c * ((t = t / d - 1.0) * t * t * t * t + 1.0) + b;\n#endif\n}\n";

THREE.BAS.ShaderChunk["quaternion_rotation"] = "vec3 rotateVector(vec4 q, vec3 v)\n{\n    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvec4 quatFromAxisAngle(vec3 axis, float angle)\n{\n    float halfAngle = angle * 0.5;\n    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));\n}\n";


THREE.BAS.PrefabBufferGeometry = function(prefab, count) {
    THREE.BufferGeometry.call(this);

    this.prefabGeometry = prefab;
    this.prefabCount = count;
    this.prefabVertexCount = prefab.vertices.length;

    this.bufferDefaults();
};
THREE.BAS.PrefabBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
THREE.BAS.PrefabBufferGeometry.prototype.constructor = THREE.BAS.PrefabBufferGeometry;

THREE.BAS.PrefabBufferGeometry.prototype.bufferDefaults = function() {
    // todo figure out how to handle normals
    var prefabIndices = [];
    var prefabUvs = [];
    var prefabFaceCount = this.prefabGeometry.faces.length;
    var prefabIndexCount = this.prefabGeometry.faces.length * 3;
    var prefabVertexCount = this.prefabVertexCount = this.prefabGeometry.vertices.length;

    //console.log('prefabCount', this.prefabCount);
    //console.log('prefabFaceCount', prefabFaceCount);
    //console.log('prefabIndexCount', prefabIndexCount);
    //console.log('prefabVertexCount', prefabVertexCount);
    //console.log('triangles', prefabFaceCount * this.prefabCount);

    for (var h = 0; h < prefabFaceCount; h++) {
        var face = this.prefabGeometry.faces[h];
        prefabIndices.push(face.a, face.b, face.c);

        var uv = this.prefabGeometry.faceVertexUvs[0][h];
        prefabUvs[face.a] = uv[0];
        prefabUvs[face.b] = uv[1];
        prefabUvs[face.c] = uv[2];
    }

    var indexBuffer = new Uint32Array(this.prefabCount * prefabIndexCount);
    var positionBuffer = new Float32Array(this.prefabCount * prefabVertexCount * 3);
    var uvBuffer = new Float32Array(this.prefabCount * prefabVertexCount * 2);

    this.setIndex(new THREE.BufferAttribute(indexBuffer, 1));
    this.addAttribute('position', new THREE.BufferAttribute(positionBuffer, 3));
    this.addAttribute('uv', new THREE.BufferAttribute(uvBuffer, 2));

    var s2 = 0, s3 = 0;

    for (var i = 0; i < this.prefabCount; i++) {
        for (var j = 0; j < prefabVertexCount; j++) {

            var prefabVertex = this.prefabGeometry.vertices[j];
            positionBuffer[s3    ] = prefabVertex.x;
            positionBuffer[s3 + 1] = prefabVertex.y;
            positionBuffer[s3 + 2] = prefabVertex.z;

            var prefabUv = prefabUvs[j];
            uvBuffer[s2    ] = prefabUv.x;
            uvBuffer[s2 + 1] = prefabUv.y;

            s2 += 2; s3 += 3;
        }

        for (var k = 0; k < prefabIndexCount; k++) {
            indexBuffer[i * prefabIndexCount + k] = prefabIndices[k] + i * prefabVertexCount;
        }
    }
};

THREE.BAS.PrefabBufferGeometry.prototype.createAttribute = function(name, itemSize) {
    var buffer = new Float32Array(this.prefabCount * this.prefabVertexCount * itemSize);
    var attribute = new THREE.BufferAttribute(buffer, itemSize);

   this.addAttribute(name, attribute);

    return attribute;
};

THREE.BAS.PrefabBufferGeometry.prototype.setAttribute4 = function(name, data) {
    var offset = 0;
    var array = this.geometry.attributes[name].array;
    var i, j;

    for (i = 0; i < data.length; i++) {
        var v = data[i];

        for (j = 0; j < this.prefabVertexCount; j++) {
            array[offset++] = v.x;
            array[offset++] = v.y;
            array[offset++] = v.z;
            array[offset++] = v.w;
        }
    }

    this.geometry.attributes[name].needsUpdate = true;
};
THREE.BAS.PrefabBufferGeometry.prototype.setAttribute3 = function(name, data) {
    var offset = 0;
    var array = this.geometry.attributes[name].array;
    var i, j;

    for (i = 0; i < data.length; i++) {
        var v = data[i];

        for (j = 0; j < this.prefabVertexCount; j++) {
            array[offset++] = v.x;
            array[offset++] = v.y;
            array[offset++] = v.z;
        }
    }

    this.geometry.attributes[name].needsUpdate = true;
};
THREE.BAS.PrefabBufferGeometry.prototype.setAttribute2 = function(name, data) {
    var offset = 0;
    var array = this.geometry.attributes[name].array;
    var i, j;

    for (i = 0; i < this.prefabCount; i++) {
        var v = data[i];

        for (j = 0; j < this.prefabVertexCount; j++) {
            array[offset++] = v.x;
            array[offset++] = v.y;
        }
    }

    this.geometry.attributes[name].needsUpdate = true;
};

THREE.BAS.BaseAnimationMaterial = function(parameters) {
    THREE.ShaderMaterial.call(this);

    this.shaderFunctions = [];
    this.shaderParameters = [];
    this.shaderVertexInit = [];
    this.shaderTransformNormal = [];
    this.shaderTransformPosition = [];

    this.setValues(parameters);
};
THREE.BAS.BaseAnimationMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
THREE.BAS.BaseAnimationMaterial.prototype.constructor = THREE.BAS.BaseAnimationMaterial;

// abstract
THREE.BAS.BaseAnimationMaterial.prototype._concatVertexShader = function() {
    return '';
};

THREE.BAS.BaseAnimationMaterial.prototype._concatFunctions = function() {
    return this.shaderFunctions.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatParameters = function() {
    return this.shaderParameters.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatVertexInit = function() {
    return this.shaderVertexInit.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatTransformNormal = function() {
    return this.shaderTransformNormal.join('\n');
};
THREE.BAS.BaseAnimationMaterial.prototype._concatTransformPosition = function() {
    return this.shaderTransformPosition.join('\n');
};


THREE.BAS.BaseAnimationMaterial.prototype.setUniformValues = function(values) {
    for (var key in values) {
        if (key in this.uniforms) {
            var uniform = this.uniforms[key];
            var value = values[key];

            // todo add matrix uniform types
            switch (uniform.type) {
                case 'c': // color
                    uniform.value.set(value);
                    break;
                case 'v2': // vectors
                case 'v3':
                case 'v4':
                    uniform.value.copy(value);
                    break;
                case 'f': // float
                case 't': // texture
                    uniform.value = value;
            }
        }
    }
};

THREE.BAS.PhongAnimationMaterial = function(parameters, uniformValues) {
    THREE.BAS.BaseAnimationMaterial.call(this, parameters);

    var phongShader = THREE.ShaderLib['phong'];

    this.uniforms = THREE.UniformsUtils.merge([phongShader.uniforms, this.uniforms]);
    this.lights = true;
    this.vertexShader = this._concatVertexShader();
    this.fragmentShader = phongShader.fragmentShader;

    // todo add missing default defines
    uniformValues.map && (this.defines['USE_MAP'] = '');
    uniformValues.normalMap && (this.defines['USE_NORMALMAP'] = '');

    this.setUniformValues(uniformValues);
};
THREE.BAS.PhongAnimationMaterial.prototype = Object.create(THREE.BAS.BaseAnimationMaterial.prototype);
THREE.BAS.PhongAnimationMaterial.prototype.constructor = THREE.BAS.PhongAnimationMaterial;

THREE.BAS.PhongAnimationMaterial.prototype._concatVertexShader = function() {
    // based on THREE.ShaderLib.phong
    return [
        "varying vec3 vViewPosition;",

        "#ifndef FLAT_SHADED",

        "	varying vec3 vNormal;",

        "#endif",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "uv_pars_vertex" ],
        THREE.ShaderChunk[ "uv2_pars_vertex" ],
        THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
        THREE.ShaderChunk[ "envmap_pars_vertex" ],
        THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
        THREE.ShaderChunk[ "color_pars_vertex" ],
        THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
        THREE.ShaderChunk[ "skinning_pars_vertex" ],
        THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

        this._concatFunctions(),

        this._concatParameters(),

        "void main() {",

        this._concatVertexInit(),

        THREE.ShaderChunk[ "uv_vertex" ],
        THREE.ShaderChunk[ "uv2_vertex" ],
        THREE.ShaderChunk[ "color_vertex" ],
        THREE.ShaderChunk[ "beginnormal_vertex" ],

        this._concatTransformNormal(),

        THREE.ShaderChunk[ "morphnormal_vertex" ],
        THREE.ShaderChunk[ "skinbase_vertex" ],
        THREE.ShaderChunk[ "skinnormal_vertex" ],
        THREE.ShaderChunk[ "defaultnormal_vertex" ],

        "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

        "	vNormal = normalize( transformedNormal );",

        "#endif",

        THREE.ShaderChunk[ "begin_vertex" ],

        this._concatTransformPosition(),

        THREE.ShaderChunk[ "displacementmap_vertex" ],
        THREE.ShaderChunk[ "morphtarget_vertex" ],
        THREE.ShaderChunk[ "skinning_vertex" ],
        THREE.ShaderChunk[ "project_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_vertex" ],

        "	vViewPosition = - mvPosition.xyz;",

        THREE.ShaderChunk[ "worldpos_vertex" ],
        THREE.ShaderChunk[ "envmap_vertex" ],
        THREE.ShaderChunk[ "lights_phong_vertex" ],
        THREE.ShaderChunk[ "shadowmap_vertex" ],

        "}"

    ].join( "\n" );
};
