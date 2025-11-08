#version 300 es
precision lowp float;

in vec2 a_position;
in vec2 a_texCoord;
uniform mat3 u_transform;
out vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    vec3 temp = u_transform * vec3(a_position.xy, 1.0);
    gl_Position =  vec4(temp.xy, 0.0, 1.0);
}

