# Model — Field Boundary

Planar interface between two linear isotropic media. Static fields; optional
free surface charge (σ_f, Electric screen) and free surface current (K_f,
Magnetic screen). Both default to 0 (source-free).

## Coordinates

- Origin on the interface; \(+x\) tangential; \(+\hat{n}=+\hat{y}\) into medium 1 (upper half-plane).
- Medium 1: \(y>0\). Medium 2: \(y<0\).
- Primary angle \(\theta\) is measured from \(\hat{n}\) toward \(+\hat{x}\):
  \(E_t = |E|\sin\theta\), \(E_n = |E|\cos\theta\).

## Electric

With \(\varepsilon=\varepsilon_r\) (\(\varepsilon_0=1\)) and free surface charge
density \(\sigma_f\) on the interface:

\[
E_{2t}=E_{1t},\qquad
\varepsilon_1 E_{1n}-\varepsilon_2 E_{2n}=\sigma_f
\;\;\Rightarrow\;\;
E_{2n}=\frac{\varepsilon_1 E_{1n}-\sigma_f}{\varepsilon_2},\qquad
\vec{D}_i=\varepsilon_i\vec{E}_i.
\]

With \(\sigma_f=0\): \(D_{1n}=D_{2n}\) and \(D_{2t}/D_{1t}=\varepsilon_2/\varepsilon_1\).
With \(\sigma_f\ne 0\): \(D_{1n}-D_{2n}=\sigma_f\); large positive \(\sigma_f\) can
reverse \(E_{2n}\) so the medium-2 field points away from medium 1.

Polarization \(\vec{P}_i=(\varepsilon_i-1)\vec{E}_i\) leaves bound surface charge

\[
\sigma_b=P_{1n}-P_{2n},
\]

so \(E_{1n}-E_{2n}=\sigma_f-\sigma_b\). When \(\sigma_f=0\), the normal-\(E\) jump
is entirely due to \(\sigma_b\). Vacuum (\(\varepsilon=1\)) has \(\vec{P}=0\).
Equal media with \(\sigma_f=0\) have \(\sigma_b=0\).

Field-line angles from the normal satisfy

\[
\frac{\tan\theta_2}{\tan\theta_1}=\frac{\varepsilon_2 E_{1n}}{\varepsilon_1 E_{1n}-\sigma_f},
\]

which reduces to \(\varepsilon_2/\varepsilon_1\) when \(\sigma_f=0\).

## Magnetic

With \(\mu=\mu_r\) (\(\mu_0=1\)) and free surface current density \(K_f\) along
\(+\hat z\) (out of the t–n page):

\[
\hat n\times(\vec H_1-\vec H_2)=K_f\hat z
\;\;\Rightarrow\;\;
H_{2t}=H_{1t}+K_f,\qquad
B_{1n}=B_{2n}\;\;\Rightarrow\;\;H_{2n}=\frac{\mu_1}{\mu_2}H_{1n},\qquad
\vec{B}_i=\mu_i\vec{H}_i.
\]

With \(K_f=0\): \(H_{1t}=H_{2t}\). Positive \(K_f\) (⊙, out of page) increases
\(H_{2t}\); negative \(K_f\) (⊗, into page) decreases it.

Magnetization \(\vec{M}_i=(\mu_i-1)\vec{H}_i\) leaves a bound surface current
(scalar along \(+\hat z\))

\[
K_b=M_{2t}-M_{1t},
\]

so \(B_{2t}-B_{1t}=K_f+K_b\): the tangential \(B\) jump is the *total* surface
current, exactly as the normal \(E\) jump is the total surface charge. This is the
dual of \(\sigma_b=P_{1n}-P_{2n}\). Air (\(\mu=1\)) has \(\vec{M}=0\); equal
media with \(K_f=0\) have \(K_b=0\).

## Integral laws (pillbox / loop)

The boundary conditions follow from the integral laws applied to a region
straddling the interface, of width \(w\) and half-height \(h\).

Gaussian pillbox, \(\oint\vec{D}\cdot d\vec{A}=Q_{f,\mathrm{enc}}\):

\[
\underbrace{D_{1n}w}_{\text{top}}\;\underbrace{-\,D_{2n}w}_{\text{bottom}}\;
+\;\underbrace{(D_{1t}+D_{2t})h-(D_{1t}+D_{2t})h}_{\text{sides}}=\sigma_f w .
\]

Amperian loop (counterclockwise, \(\hat z\) out of page),
\(\oint\vec{H}\cdot d\vec{l}=I_{f,\mathrm{enc}}\):

\[
\underbrace{H_{2t}w}_{\text{bottom}}\;\underbrace{-\,H_{1t}w}_{\text{top}}\;
+\;\underbrace{(H_{1n}+H_{2n})h-(H_{1n}+H_{2n})h}_{\text{sides}}=K_f w .
\]

For uniform fields the two side terms are equal and opposite, so they cancel
exactly; each is individually proportional to \(h\) and vanishes as the region
collapses onto the interface. Dividing by \(w\) recovers
\(D_{1n}-D_{2n}=\sigma_f\) and \(H_{2t}-H_{1t}=K_f\).

## Display

Fields are continuous across the boundary: a medium-2 physics vector
\((F_t,F_n)\) with \(F_n>0\) points toward \(+\hat n\) (up, into medium 1), the
same direction as medium 1. It is drawn in the lower half-plane by anchoring its
tip at the interface and its tail at \((-F_t,-F_n)\), so for equal media the two
arrows are parallel and form one straight field line. Field lines are likewise
continuous (straight when \(\varepsilon_1=\varepsilon_2\), kinked otherwise).
Companion \(\vec{D}\) or \(\vec{B}\) arrows are auto-scaled relative to the
primary so large \(\varepsilon_r\)/\(\mu_r\) stay on-screen. Component-axis
overlays still reflect medium-2 magnitudes into the lower half-plane via
`medium2DisplayVector` to compare \(|E_n|\)/\(|D_n|\) across the interface.
The companion scale factor is shown next to the \(\vec{D}\)/\(\vec{B}\) label
(e.g. ×0.46) so the drawn lengths are not read as true relative magnitudes.
The model-view transform is isotropic — \(2\,\mathrm{MODEL\_HALF\_HEIGHT}\) is
derived from the play-area aspect ratio — so drawn angles equal the angles the
\(\theta\) readout and the protractor report.
Free surface sources are drawn on the interface: \(+\)/\(-\) markers for
\(\sigma_f\), and ⊙/⊗ markers for \(K_f\) (out of / into the page). Each screen
has an optional bound-source layer drawn with hollow dashed glyphs offset from
the free markers: \(\vec{P}\) and \(\sigma_b\) on Electric (why \(E_n\) jumps),
\(\vec{M}\) and \(K_b\) on Magnetic (why \(B_t\) jumps).
