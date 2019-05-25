import {Vector3} from "../math/Vector3";
import {Sphere} from "../math/Sphere";
import {Box3} from "../math/Box3";

class SphereGeometry {
    constructor( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

        radius = radius || 1;

        widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
        heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

        phiStart = phiStart !== undefined ? phiStart : 0;
        phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

        thetaStart = thetaStart !== undefined ? thetaStart : 0;
        thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

        var thetaEnd = thetaStart + thetaLength;

        var ix, iy;

        var index = 0;
        var grid = [];

        var vertex = new Vector3();
        var normal = new Vector3();

        // buffers

        var indices = [];
        var vertices = [];
        var normals = [];
        var uvs = [];

        // generate vertices, normals and uvs

        for ( iy = 0; iy <= heightSegments; iy ++ ) {

            var verticesRow = [];

            var v = iy / heightSegments;

            for ( ix = 0; ix <= widthSegments; ix ++ ) {

                var u = ix / widthSegments;

                // vertex

                vertex = new Vector3(
                    - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength ),
                    radius * Math.cos( thetaStart + v * thetaLength ),
                    radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength )
                );

                vertices.push( vertex.x, vertex.y, vertex.z );

                // normal

                normal = vertex.clone().normalize();
                normals.push( normal.x, normal.y, normal.z );

                // uv

                uvs.push( u, 1 - v );

                verticesRow.push( index ++ );

            }

            grid.push( verticesRow );

        }

        // indices

        for ( iy = 0; iy < heightSegments; iy ++ ) {

            for ( ix = 0; ix < widthSegments; ix ++ ) {

                var a = grid[ iy ][ ix + 1 ];
                var b = grid[ iy ][ ix ];
                var c = grid[ iy + 1 ][ ix ];
                var d = grid[ iy + 1 ][ ix + 1 ];

                if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
                if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );

            }

        }

        this.vertices = new Float32Array(vertices);
        this.normal = new Float32Array(normals);
        this.uv = new Float32Array(uvs);

        this.indices = new Uint16Array(indices);

        var buffer = [];
        var vertices = this.vertices;
        var normal = this.normal;
        var uv = this.uv;
        for(var i=0; i<vertices.length; i+=3){
            buffer.push(vertices[i+0]);
            buffer.push(vertices[i+1]);
            buffer.push(vertices[i+2]);

            buffer.push(normal[i+0]);
            buffer.push(normal[i+1]);
            buffer.push(normal[i+2]);

            buffer.push(uv[i/3*2+0]);
            buffer.push(uv[i/3*2+1]);
        }

        this.buffer = new Float32Array(buffer);

        this.boundingSphere = new Sphere();
        this.boundingBox = new Box3();
        this.computeBoundingBox();

    }

    computeBoundingBox () {
        var verticesV3 = [];
        for(var i=0; i<this.vertices.length; i+=3){
            verticesV3.push(new Vector3(this.vertices[i], this.vertices[i+1], this.vertices[i+2]))
        }
        this.boundingBox.setFromPoints(verticesV3);
    }

}

export default SphereGeometry;
