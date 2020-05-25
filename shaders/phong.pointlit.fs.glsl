precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // todo - diffuse contribution
    // 1. normalize the light direction and store in a separate variable
    // 2. normalize the world normal and store in a separate variable
    // 3. calculate the lambert term

    // todo - specular contribution
    // 1. in world space, calculate the direction from the surface point to the eye (normalized)
    // 2. in world space, calculate the reflection vector (normalized)
    // 3. calculate the phong term

    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    // todo - combine
    // 1. apply light and material interaction for diffuse value by using the texture color as the material
    // 2. apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)

    vec3 ambient = albedo * 0.1;
    // 
    
   
	
	//vWorldNormal = normalize(vWorldNormal);
	vec3 worldSpaceNormal = normalize(vWorldNormal);
	
	vec3 normLightPosition = normalize(uLightPosition - vWorldPosition);
	//vec3 grayScale = vec3(0.75, 0.75, 0.75);
	
	vec3 eyeVector = normalize(uCameraPosition - vWorldPosition);
	//ref = -LightVec + 2(LightVec.dot(vWorldSpaceNormal)) * vWorldSpaceNormal
	vec3 reflection = (-1.0 * uLightPosition) + (2.0 * (dot(uLightPosition, worldSpaceNormal)) * (worldSpaceNormal) );
	float lambert = max(dot(worldSpaceNormal, normLightPosition), 0.0);
	float phong = max(dot(normalize(reflection), eyeVector), 0.0);
	phong = pow(phong, 64.0);
	vec3 phongVector = vec3(phong, phong, phong);
	vec3 diffuseColor = albedo * lambert;
	vec3 specularColor = vec3(0.3, 0.3, 0.3) * phong;
	//float lambert = max(lamDot, 0.0);
	//grayScale = normalize(grayScale);
    //gl_FragColor = vec4(finalColor, 1.0);
	vec3 finalColor = ambient + diffuseColor + specularColor;
	//gl_FragColor = vec4(normLightPosition, 1.0); 
	
	//gl_FragColor = vec4(worldSpaceNormal, 1.0);
	//gl_FragColor = vec4(grayScale * lambert, 1.0);
	//gl_FragColor = vec4(eyeVector, 1.0);
	//gl_FragColor = vec4(reflection, 1.0);
	//gl_FragColor = vec4(phongVector, 1.0);
	gl_FragColor = vec4(finalColor, 1.0);
	//gl_FragColor = texture2D(uTexture, vTexcoords);
	//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
