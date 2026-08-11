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
Free surface sources are drawn on the interface: \(+\)/\(-\) markers for
\(\sigma_f\), and ⊙/⊗ markers for \(K_f\) (out of / into the page). On the
Electric screen, an optional bound-charge layer shows \(\vec{P}\) arrows and
hollow \(\sigma_b\) glyphs (offset from free-charge markers) explaining why
\(E_n\) jumps when \(\varepsilon\) differs.
