/*
 * A simple object to encapsulate the data and operations of object rasterization
 */
function WebGLGeometryQuad(gl) {
	this.gl = gl;
	this.worldMatrix = new Matrix4();

	// -----------------------------------------------------------------------------
	this.create = function(rawImage) {
        var verts = [
            -3.0,   -3.0,   0.0,
            3.0,    -3.0,   0.0,
            -3.0,   3.0,    0.0,
            -3.0,   3.0,    0.0,
            3.0,    -3.0,   0.0,
            3.0,    3.0,    0.0
        ];

        var normals = [
            0.0,    0.0,    1.0,
            0.0,    0.0,    1.0,
            0.0,    0.0,    1.0,
            0.0,    0.0,    1.0,
            0.0,    0.0,    1.0,
            0.0,    0.0,    1.0
        ];

        var uvs = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ];

        // create the position and color information for this object and send it to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.texCoordsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        if (rawImage) {
            this.texture = this.gl.createTexture();
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                rawImage
            );
            this.gl.bindTexture(gl.TEXTURE_2D, null);
        }
	}

	// -------------------------------------------------------------------------
	this.render = function(camera, projectionMatrix, shaderProgram, face) {
        // todo - this should be somewhere else
        var scale = new Matrix4().scale(20.0, 20.0, 20.0);

        // compensate for the model being flipped on its side
        var rotationX = new Matrix4().setRotationX(-90);
		var rotationY = new Matrix4().setRotationY(-90);
		var rotationZ = new Matrix4().setRotationZ(-90);

        this.worldMatrix.identity();
        //this.worldMatrix.multiplyRightSide(rotationX);
        this.worldMatrix.multiplyRightSide(scale);
		this.worldMatrix.translate(0, -10, 0);

        gl.useProgram(shaderProgram);
		
		if(face == 0) {
			this.worldMatrix.identity();
			rotationX = new Matrix4().setRotationX(90);
			this.worldMatrix.multiplyRightSide(rotationX);
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(0, -50, 0);
		} else if(face == 1) {
			this.worldMatrix.identity();
			rotationX = new Matrix4().setRotationX(90);
			rotationY = new Matrix4().setRotationY(-90);
			this.worldMatrix.multiplyRightSide(rotationX);
			this.worldMatrix.multiplyRightSide(rotationY);
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(50, 0, 0);
		} else if(face == 2) {
			this.worldMatrix.identity();
			rotationX = new Matrix4().setRotationX(90);
			this.worldMatrix.multiplyRightSide(rotationX);		
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(0, 50, 0);
		}	else if(face == 3) {
			this.worldMatrix.identity();
			rotationX = new Matrix4().setRotationX(90);
			rotationY = new Matrix4().setRotationY(-90);
			this.worldMatrix.multiplyRightSide(rotationX);
			this.worldMatrix.multiplyRightSide(rotationY);			
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(-50, 0, 0);
		}	else if(face == 4) {
			this.worldMatrix.identity();
			rotationZ = new Matrix4().setRotationZ(-90);
			this.worldMatrix.multiplyRightSide(rotationZ);				
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(0, 0, 50);
		}	else if(face == 5) {
			this.worldMatrix.identity();
			rotationZ = new Matrix4().setRotationZ(-90);
			this.worldMatrix.multiplyRightSide(rotationZ);				
			this.worldMatrix.multiplyRightSide(scale);
			this.worldMatrix.translate(0, 0, -50);
		}
		
		
		
		
		
        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
            gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        // Send our matrices to the shader
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }
	}
}