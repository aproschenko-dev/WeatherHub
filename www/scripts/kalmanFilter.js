// refer https://wouterbulten.nl/blog/tech/lightweight-javascript-library-for-noise-filtering/

// defaults are: R = 1, Q = 1, A = 1, B = 0, C = 1
function kalman(r, q, a, b, c) {

    var R = r;
    var Q = q;
    var A = a;
    var B = b;
    var C = c;

    var cov = NaN;
    var x = NaN;

    // defaults are: u = 0
    function filter(z, u) {
        if (isNaN(x)) {
            x = (1 / C) * z;
            cov = (1 / C) * Q * (1 / C);
        } else {
            // Compute prediction
            var predX = (A * x) + (B * u);
            var predCov = ((A * cov) * A) + R;

            // Kalman gain
            var K = predCov * C * (1 / ((C * predCov * C) + Q));

            // Correction
            x = predX + K * (z - (C * predX));
            cov = predCov - (K * C * predCov);
        }

        return x;
    }
    this.filter = filter;

}