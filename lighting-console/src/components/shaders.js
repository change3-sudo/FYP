// shaders.js
export const vertexShader = `
struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
};

@vertex
fn main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(input.position, 1.0);
    output.normal = input.normal;
    return output;
}
`;

export const fragmentShader = `
struct AmbientLight {
    color: vec3<f32>,
    intensity: f32,
};

@group(0) @binding(0) var<uniform> ambientLight: AmbientLight;

@fragment
fn main(input: VertexOutput) -> @location(0) vec4<f32> {
    let ambient = ambientLight.color * ambientLight.intensity;
    return vec4<f32>(ambient, 1.0);
}
`;
