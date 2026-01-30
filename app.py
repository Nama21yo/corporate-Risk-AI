import streamlit as st
import pandas as pd
import numpy as np
import pickle
import shap
import matplotlib.pyplot as plt

st.set_page_config(
    page_title="Corporate Risk AI",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
    <style>
    /* Global Styles */
    .main {
        background-color: #f8f9fa;
    }
    h1, h2, h3 {
        color: #2c3e50;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Card Styling */
    .metric-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        border: 1px solid #e1e4e8;
        margin-bottom: 20px;
    }
    
    /* Result Indicators */
    .safe-badge {
        background-color: #d4edda;
        color: #155724;
        padding: 10px 20px;
        border-radius: 50px;
        font-weight: bold;
        display: inline-block;
        font-size: 1.2em;
    }
    .risk-badge {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px 20px;
        border-radius: 50px;
        font-weight: bold;
        display: inline-block;
        font-size: 1.2em;
    }
    
    /* Button Styling */
    div.stButton > button {
        background-color: #2c3e50;
        color: white;
        border-radius: 8px;
        height: 50px;
        font-size: 16px;
        font-weight: 600;
        width: 100%;
        border: none;
        transition: all 0.3s ease;
    }
    div.stButton > button:hover {
        background-color: #34495e;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    /* Sidebar clarity */
    .sidebar-text {
        font-size: 0.9em;
        color: #6c757d;
    }
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# 1. Load the Saved Model
# ==========================================
@st.cache_resource
def load_data():
    """Load model, scaler, and metadata from pickle file."""
    import os
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'financial_risk_model.pkl')
    with open(model_path, 'rb') as file:
        return pickle.load(file)

try:
    data = load_data()
    model = data["model"]
    scaler = data["scaler"]
    feature_names = data["feature_names"]
except FileNotFoundError:
    st.error("⚠️ Model file not found. Ensure 'models/financial_risk_model.pkl' is in the directory.")
    st.stop()

def get_mean_value(feature_name):
    """Retrieve the mean value of a feature from the training scaler to set neutral defaults."""
    try:
        names = list(feature_names)
        idx = names.index(feature_name)
        return float(scaler.mean_[idx])
    except (ValueError, IndexError):
        return 0.5

# ==========================================
# 2. Sidebar - Global Settings
# ==========================================
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/7604/7604036.png", width=60)
    st.title("Financial Risk AI")
    st.markdown("Developed for **Enterprise Risk Assessment**")
    st.info("💡 **Tip:** Use 'Batch Audit' for bulk processing.")
    st.markdown("---")

# ==========================================
# 3. Application Structure
# ==========================================

st.title("Corporate Bankruptcy Risk Assessment")
st.markdown("### AI-Powered Financial Health Diagnostics")

tab1, tab2 = st.tabs(["🏢 Single Company Simulator", "📂 Batch Portfolio Audit"])

# TAB 1: Single Company Simulator
with tab1:
    st.markdown("**Interactive Stress Testing**: Adjust the key financial levers below to simulate a specific company's operating scenario.")
    
    st.subheader("Financial Indicators")
    col_input1, col_input2 = st.columns(2)
    
    with col_input1:
        st.markdown("#### 📊 Solvency & Leverage")
        borrowing = st.slider(
            'Borrowing Dependency', 
            0.0, 1.0, get_mean_value('Borrowing dependency'),
            help="Dependency on external borrowing relative to total capital."
        )
        liability_equity = st.slider(
            'Liability to Equity Ratio', 
            0.0, 1.0, get_mean_value('Liability to Equity'),
            help="The proportion of company funds contributed by creditors vs owners."
        )

    with col_input2:
        st.markdown("#### 💰 Profitability & Efficiency")
        interest = st.slider(
            'Continuous Interest Rate (After Tax)', 
            0.0, 1.0, get_mean_value('Continuous interest rate (after tax)'),
            help="Effective interest rate burden ensuring tax adjustments."
        )
        net_worth = st.slider(
            'Net Worth / Assets', 
            0.0, 1.0, get_mean_value('Net worth/Assets'),
            help="Shareholder equity relative to total assets."
        )
        eps = st.slider(
            'Persistent EPS (Last 4 Seasons)', 
            0.0, 1.0, get_mean_value('Persistent EPS in the Last Four Seasons'),
            help="Earnings Per Share consistency over the last year."
        )

    user_data = {
        'Borrowing dependency': borrowing,
        'Continuous interest rate (after tax)': interest,
        'Net worth/Assets': net_worth,
        'Persistent EPS in the Last Four Seasons': eps,
        'Liability to Equity': liability_equity
    }
    
    # Initialize with average values for all features to represent a neutral company
    input_values = scaler.mean_.reshape(1, -1)
    input_df = pd.DataFrame(input_values, columns=feature_names)
    
    # Update specifically adjusted features
    for col, value in user_data.items():
        if col in input_df.columns:
            input_df[col] = value
    input_scaled = scaler.transform(input_df)

    st.markdown("---")
    st.markdown("### 🔍 Analysis Results")

    if st.button("Run Risk Assessment", key="single_sim_btn"):
        with st.spinner("Analyzing financial indicators..."):
            probability = model.predict_proba(input_scaled)[0][1]
            
            # Risk Threshold (40% to account for base rate)
            THRESHOLD = 0.40
            prediction_class = probability > THRESHOLD
            
            res_col1, res_col2 = st.columns([1, 1])
            
            with res_col1:
                st.markdown('<div class="metric-card">', unsafe_allow_html=True)
                st.markdown("#### Risk Probability Score")
                
                st.markdown(f"<h1 style='font-size: 3.5em; color: {'#e74c3c' if prediction_class else '#27ae60'};'>{probability:.1%}</h1>", unsafe_allow_html=True)
                
                if prediction_class:
                    st.markdown('<div class="risk-badge">⚠️ HIGH RISK DETECTED</div>', unsafe_allow_html=True)
                    st.markdown(f"<p style='margin-top:10px;'>Risk Score exceeds safety threshold of {THRESHOLD:.0%}. The company exhibits strong signals of financial distress.</p>", unsafe_allow_html=True)
                else:
                    st.markdown('<div class="safe-badge">✅ FINANCIALLY STABLE</div>', unsafe_allow_html=True)
                    st.markdown(f"<p style='margin-top:10px;'>Risk Score is below safety threshold of {THRESHOLD:.0%}. Current metrics suggest a healthy financial outlook.</p>", unsafe_allow_html=True)
                
                st.progress(float(probability))
                st.markdown('</div>', unsafe_allow_html=True)

            with res_col2:
                st.markdown('<div class="metric-card">', unsafe_allow_html=True)
                st.markdown("#### Key Risk Drivers (SHAP Analysis)")
                st.markdown("<p style='font-size:0.9em; color:#666;'>Factors pushing the model towards 'Risk' (Right) or 'Safe' (Left).</p>", unsafe_allow_html=True)
                
                try:
                    explainer = shap.TreeExplainer(model)
                    shap_values = explainer.shap_values(input_scaled)
                    
                    if isinstance(shap_values, list):
                        sv = shap_values[1][0]
                    else:
                        sv = shap_values[0, :, 1]
                    
                    shap_df = pd.DataFrame({
                        'Feature': feature_names,
                        'SHAP Value': sv
                    })
                    top_features = shap_df.reindex(shap_df["SHAP Value"].abs().sort_values(ascending=False).index).head(5)
                    
                    fig, ax = plt.subplots(figsize=(5, 3))
                    colors = ['#ff4b4b' if x > 0 else '#00cc96' for x in top_features['SHAP Value']]
                    
                    y_pos = np.arange(len(top_features))
                    ax.barh(y_pos, top_features['SHAP Value'], color=colors)
                    ax.set_yticks(y_pos)
                    ax.set_yticklabels(top_features['Feature'], fontsize=9)
                    ax.set_xlabel("Impact on Risk Score", fontsize=8)
                    ax.axvline(0, color='black', linewidth=0.8, linestyle='--')
                    ax.invert_yaxis()
                    
                    ax.spines['right'].set_visible(False)
                    ax.spines['top'].set_visible(False)
                    ax.spines['left'].set_visible(False)
                    
                    st.pyplot(fig, use_container_width=True)
                except Exception as e:
                    st.warning(f"Could not generate SHAP explanation: {e}")
                
                st.markdown('</div>', unsafe_allow_html=True)


# Footer
st.markdown("---")
st.markdown("<div style='text-align: center; color: #aaa; font-size: 0.8em;'>© 2024 Financial AI Systems. Powered by Streamlit & SHAP.</div>", unsafe_allow_html=True)
